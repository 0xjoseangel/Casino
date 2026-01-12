import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Apuestas() {
  const [apuestas, setApuestas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [jugadoresList, setJugadoresList] = useState([]); // Lista para el dropdown de admin
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [jugador, setJugador] = useState(null);

  // Estado para admin
  const [esAdmin, setEsAdmin] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState('');

  const [form, setForm] = useState({
    juego: '',
    cantidad_apostada: ''
  });

  useEffect(() => {
    // Obtener el jugador logueado del localStorage
    const usuarioGuardado = localStorage.getItem('casino_usuario');
    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      setJugador(usuario);
      setEsAdmin(usuario.rol === 'admin');
    }
    cargarDatos();
  }, [filtroUsuario]); // Recargar si cambia el filtro

  const cargarDatos = async () => {
    // Obtener info del usuario para la query
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
        // REFRESCAR DATOS DEL JUGADOR (Saldo actualizado)
        // Usamos el endpoint de jugadores con filtro DNI o get directo si estuviera implementado detalle
        // Pero como JugadorViewSet es ModelViewSet, podemos pedir lista filtrada o detalle.
        // Asumimos que tenemos acceso a listar.
        const resUser = await getData(`/usuarios/jugadores/?dni=${usuario.dni}`);
        // ModelViewSet con ?dni=... (si filtramos en get_queryset) o si el filtro standard de django funcionas
        // Pero espera, JugadorViewSet no tiene get_queryset con filtro explicito de query param 'dni', 
        // pero usa ModelViewSet standard.
        // Mejor intento: Pedir el detalle directo si DNI es PK.
        // Pedir el detalle directo
        const resDetalle = await getData(`usuarios/jugadores/${usuario.dni}/?t=${new Date().getTime()}`);
        console.log("🔄 REFRESCO JUGADOR:", resDetalle);

        if (resDetalle && !resDetalle.error) {
          // Asegurarnos de que cartera_monetaria esté presente
          if (resDetalle.cartera_monetaria !== undefined) {
            console.log("✅ Saldo actualizado a:", resDetalle.cartera_monetaria);
            setJugador(prev => ({ ...prev, ...resDetalle }));
            localStorage.setItem('casino_usuario', JSON.stringify({ ...usuario, ...resDetalle }));
          }
        }
      }
    }

    // Cargar apuestas (pasando contexto)
    const resApuestas = await getData(`movimientos/apuestas/${queryParams}`);
    if (resApuestas && !resApuestas.error) {
      setApuestas(resApuestas);
    }

    // Si es admin, cargar lista de jugadores para el filtro
    if (isAdmin) {
      const resJug = await getData('usuarios/jugadores/');
      if (resJug && !resJug.error) setJugadoresList(resJug);
    }

    // Cargar juegos disponibles
    const resJuegos = await getData('juegos/juegos/'); // removed leading slash to be safe

    // DEFINU JUEGOS FALLBACK para robustez
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

    // Validaciones Locales
    if (cantidadNum <= 0) {
      alert('La apuesta debe ser mayor a 0.');
      setEnviando(false);
      return;
    }

    if (jugador && cantidadNum > jugador.cartera_monetaria) {
      alert('⚠️ Saldo insuficiente para realizar esta apuesta.');
      setEnviando(false);
      return;
    }

    const datosApuesta = {
      usuario: jugador.dni,
      juego: form.juego,
      cantidad_apostada: form.cantidad_apostada
    };

    const resultado = await postData('movimientos/apuestas/', datosApuesta);

    if (resultado && !resultado.error) {
      alert('Apuesta realizada con éxito');
      setForm({ juego: '', cantidad_apostada: '' });
      cargarDatos();
    } else {
      alert('Error al apostar. Revisa tu saldo disponible.');
    }
    setEnviando(false);
  };

  // Filtrar apuestas: Si es admin y NO filtra, ve todo. Si filtra, ve solo ese usuario. Si es jugador, solo lo suyo.
  // Pero como ya lo hemos filtrado en el backend, aquí solo necesitamos mostrarlas todas las que vengan en 'apuestas'
  // El filtro de .filter() anterior era lo que escondía las cosas al Admin, porque el Admin no tenia dni coincidente.
  const apuestasAMostrar = apuestas;
  /* 
     NOTA: Antes filtrábamos aquí por DNI.
     Ahora confiamos en lo que nos manda el backend según la query.
  */

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
            <h3>Mi Saldo</h3>
            <p className="stat-number neon">{jugador.cartera_monetaria || '---'}€</p>
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
              {jugador && (
                <span className="badge badge-success">
                  Jugando como: {jugador.nombre}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
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
                    min="1"
                    step="0.01"
                    value={form.cantidad_apostada}
                    onChange={(e) => setForm({ ...form, cantidad_apostada: e.target.value })}
                    placeholder="Ej: 10.00"
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
    </div>
  );
}

export default Apuestas;
