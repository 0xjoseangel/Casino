import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Apuestas() {
  const idDesdeUrl = new URLSearchParams(window.location.search).get('juegoId');
  const [apuestas, setApuestas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [jugadoresList, setJugadoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [jugador, setJugador] = useState(null);

  const [esAdmin, setEsAdmin] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState('');


  const [sesionActiva, setSesionActiva] = useState(false);
  const [sesionData, setSesionData] = useState(null);

  const [form, setForm] = useState({
    juego: idDesdeUrl || '',
    cantidad_apostada: ''
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('casino_usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setJugador(usuario);
      setEsAdmin(usuario.rol === 'admin');
    }
    cargarDatos();
  }, [filtroUsuario]);

  const cargarDatos = async () => {
    const usuarioGuardado = localStorage.getItem('casino_usuario');
    let queryParams = '';
    let isAdmin = false;

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      isAdmin = usuario.rol === 'admin';

      if (isAdmin) {
        queryParams = `?rol=admin`;
        if (filtroUsuario) {
          queryParams += `&usuario=${filtroUsuario}`;
        }
      } else {
        queryParams = `?usuario=${usuario.dni}`;

        const resUser = await getData(`/usuarios/jugadores/?dni=${usuario.dni}`);

        const resDetalle = await getData(`usuarios/jugadores/${usuario.dni}/?t=${new Date().getTime()}`);
        console.log("🔄 REFRESCO JUGADOR:", resDetalle);

        if (resDetalle && !resDetalle.error) {
          if (resDetalle.cartera_monetaria !== undefined) {
            console.log("✅ Saldo actualizado a:", resDetalle.cartera_monetaria);
            setJugador(prev => ({ ...prev, ...resDetalle }));
            localStorage.setItem('casino_usuario', JSON.stringify({ ...usuario, ...resDetalle }));
          }
        }
      }
    }

    const resApuestas = await getData(`movimientos/apuestas/${queryParams}`);
    if (resApuestas && !resApuestas.error) {
      setApuestas(resApuestas);
    }

    if (isAdmin) {
      const resJug = await getData('usuarios/jugadores/');
      if (resJug && !resJug.error) setJugadoresList(resJug);
    }

    const resJuegos = await getData('juegos/juegos/');

    const JUEGOS_FALLBACK = [
      { id: 1, nombre: 'Ruleta', estado: true },
      { id: 2, nombre: 'Blackjack', estado: true },
      { id: 3, nombre: 'Poker', estado: true },
      { id: 4, nombre: 'Tragaperras', estado: true }
    ];

    if (resJuegos && Array.isArray(resJuegos) && resJuegos.length > 0) {
      setJuegos(resJuegos);
    } else {
      console.log("⚠️ API JUEGOS falló o vacía, usando fallback");
      setJuegos(JUEGOS_FALLBACK);
    }
    if (usuarioGuardado && !isAdmin) {
      const usuario = JSON.parse(usuarioGuardado);
      const resSesion = await getData(`sesiones/listado/?usuario=${usuario.dni}&activa=true`);
      if (resSesion && Array.isArray(resSesion) && resSesion.length > 0) {
        setSesionActiva(true);
        setSesionData(resSesion[0]);
      } else {
        setSesionActiva(false);
        setSesionData(null);
      }
    } else {
      setSesionActiva(false);
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jugador?.dni) {
      alert('Error: No se pudo identificar al jugador');
      return;
    }

    if (!form.juego || !form.cantidad_apostada) {
      alert('Por favor, selecciona un juego y cantidad');
      return;
    }

    setEnviando(true);

    const cantidadNum = parseFloat(form.cantidad_apostada);

    if (cantidadNum < 10) {
      alert('La apuesta mínima es de 10€.');
      setEnviando(false);
      return;
    }

    if (cantidadNum > 1000) {
      alert('La apuesta máxima es de 1.000€.');
      setEnviando(false);
      return;
    }

    if (sesionActiva && sesionData) {
      if (cantidadNum > parseFloat(sesionData.saldo_actual)) {
        alert(`⚠️ Saldo de sesión insuficiente (${sesionData.saldo_actual}€).`);
        setEnviando(false);
        return;
      }
    } else {
      if (jugador && cantidadNum > jugador.cartera_monetaria) {
        alert('⚠️ Saldo insuficiente en tu cartera.');
        setEnviando(false);
        return;
      }
    }

    const datosApuesta = {
      usuario: jugador.dni,
      juego: form.juego,
      cantidad_apostada: form.cantidad_apostada
    };

    const resultado = await postData('movimientos/apuestas/', datosApuesta);

    if (resultado && !resultado.error && resultado.id) {
      const ganancia = parseFloat(resultado.ganancia);

      if (ganancia > 0) {
        alert(`¡FELICIDADES! Has ganado ${ganancia}€`);
      } else {
        alert(`Lo siento, has perdido ${cantidadNum}€. ¡Suerte para la próxima!`);
      }

      setForm({ juego: '', cantidad_apostada: '' });
      await cargarDatos();
    } else {
      let msg = 'Error al apostar. Revisa tu saldo disponible.';
      if (Array.isArray(resultado) && resultado.length > 0) {
        msg = resultado[0];
      } else if (resultado && resultado.detail) {
        msg = resultado.detail;
      } else if (resultado && resultado.non_field_errors) {
        msg = resultado.non_field_errors[0];
      }
      alert(`⚠️ ${msg}`);
    }
    setEnviando(false);
  };


  const apuestasAMostrar = apuestas;


  if (loading) {
    return (
      <div className="fade-in">
        <div className="loading">Cargando mesa de juego...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title neon">Mesa de Juego</h1>
        <p className="page-subtitle">Realiza tus apuestas y prueba tu suerte</p>
      </div>

      {/* INFO DEL JUGADOR */}
      {jugador && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Jugador</h3>
            <p className="stat-number" style={{ fontSize: '1.25rem' }}>{jugador.nombre}</p>
          </div>
          <div className="stat-card">
            <h3>Mi Saldo {sesionActiva ? '(Sesión)' : '(Global)'}</h3>
            <p className="stat-number neon">
              {sesionActiva && sesionData
                ? `${sesionData.saldo_actual}€`
                : `${jugador.cartera_monetaria || '---'}€`
              }
            </p>
          </div>
          <div className="stat-card">
            <h3>Apuestas Realizadas</h3>
            <p className="stat-number">{apuestasAMostrar.length}</p>
          </div>
        </div>
      )}

      {/* FORMULARIO DE APUESTA */}

      {/* FILTRO SOLO PARA ADMIN */}
      {esAdmin && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #00fff2' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: '#00fff2' }}>👮 Panel de Admin: Filtrar por Jugador</label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="form-control"
            >
              <option value="">-- Ver Todas las Apuestas --</option>
              {jugadoresList.map(j => (
                <option key={j.dni} value={j.dni}>
                  {j.nombre} {j.apellidos} ({j.dni})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* FORMULARIO DE APUESTA: SOLO SI NO ES ADMIN */}
      {!esAdmin && (
        <>
          <div className="card highlight-neon">
            <div className="card-header">
              <h3 className="card-title">Nueva Apuesta</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {jugador && (
                  <span className="badge badge-success">
                    Jugando como: {jugador.nombre}
                  </span>
                )}
                {sesionActiva ? (
                  <span className="badge badge-success">🟢 Sesión Activa</span>
                ) : (
                  <span className="badge badge-error">🔴 Sin Sesión</span>
                )}
              </div>
            </div>

            {!sesionActiva && (
              <div style={{ padding: '15px', background: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', marginBottom: '15px', borderRadius: '8px' }}>
                ⚠️ <strong>Atención:</strong> Debes iniciar una sesión de juego antes de poder realizar apuestas.
                <br />Ve a la sección "Sesiones" en el menú para comenzar.
              </div>
            )}

            <form onSubmit={handleSubmit} style={!sesionActiva ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Selecciona un Juego</label>
                  <select
                    value={form.juego}
                    onChange={(e) => setForm({ ...form, juego: e.target.value })}
                    required
                  >
                    <option value="">-- Elige un juego --</option>
                    {juegos.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cantidad a Apostar (€)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="0.01"
                    value={form.cantidad_apostada}
                    onChange={(e) => setForm({ ...form, cantidad_apostada: e.target.value })}
                    placeholder="Mín: 10€ - Máx: 1000€"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-neon btn-full btn-lg"
                disabled={enviando || !form.juego || !form.cantidad_apostada}
                style={{ marginTop: '16px' }}
              >
                {enviando ? 'Procesando...' : 'Realizar Apuesta'}
              </button>
            </form>
          </div>
        </>
      )}



      {/* HISTORIAL DE MIS APUESTAS */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historial de Apuestas</h3>
          <span className="badge badge-gold">{apuestasAMostrar.length} apuestas</span>
        </div>

        {apuestasAMostrar.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Juego</th>
                  <th>Apostado</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {apuestasAMostrar.map(a => (
                  <tr key={a.id}>
                    <td>{new Date(a.fecha).toLocaleString()}</td>
                    <td>{a.juego_nombre || a.juego}</td>
                    <td className="text-gold">-{a.cantidad_apostada}€</td>
                    <td>
                      <span className={a.ganancia > 0 ? 'badge badge-success' : 'badge badge-error'}>
                        {a.ganancia > 0 ? `+${a.ganancia}€` : 'Sin premio'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🎲</div>
            <p>No hay apuestas registradas con este filtro.</p>
          </div>
        )}
      </div>
    </div >
  );
}

export default Apuestas;
