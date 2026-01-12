import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Apuestas() {
  const [apuestas, setApuestas] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [jugador, setJugador] = useState(null);

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
    }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // Cargar apuestas del jugador actual
    const resApuestas = await getData('/movimientos/apuestas/');
    if (resApuestas && !resApuestas.error) {
      setApuestas(resApuestas);
    }

    // Cargar juegos disponibles
    const resJuegos = await getData('/juegos/juegos/');
    if (resJuegos && !resJuegos.error) {
      setJuegos(resJuegos);
    } else {
      // Fallback con juegos de ejemplo
      setJuegos([
        { id: 1, nombre: 'Ruleta' },
        { id: 2, nombre: 'Blackjack' },
        { id: 3, nombre: 'Poker' }
      ]);
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

    const datosApuesta = {
      usuario: jugador.dni,
      juego: form.juego,
      cantidad_apostada: form.cantidad_apostada
    };

    const resultado = await postData('/movimientos/apuestas/', datosApuesta);

    if (resultado && !resultado.error) {
      alert('Apuesta realizada con éxito');
      setForm({ juego: '', cantidad_apostada: '' });
      cargarDatos();
    } else {
      alert('Error al apostar. Revisa tu saldo disponible.');
    }
    setEnviando(false);
  };

  // Filtrar apuestas del jugador actual
  const misApuestas = apuestas.filter(a =>
    a.usuario === jugador?.dni || a.usuario === jugador?.id
  );

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
            <p className="stat-number">{misApuestas.length}</p>
          </div>
        </div>
      )}

      {/* FORMULARIO DE APUESTA */}
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

      {/* JUEGOS DISPONIBLES */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Juegos Disponibles</h3>
          <span className="badge badge-info">{juegos.length} juegos</span>
        </div>
        <div className="modules-grid">
          {juegos.map(j => (
            <div
              key={j.id}
              className={`module-card ${form.juego === String(j.id) ? 'highlight-neon' : ''}`}
              onClick={() => setForm({ ...form, juego: String(j.id) })}
              style={{ cursor: 'pointer' }}
            >
              <div className="icon">
                {j.nombre === 'Ruleta' && '🎡'}
                {j.nombre === 'Blackjack' && '🃏'}
                {j.nombre === 'Poker' && '♠️'}
                {!['Ruleta', 'Blackjack', 'Poker'].includes(j.nombre) && '🎰'}
              </div>
              <h3>{j.nombre}</h3>
              <p>{form.juego === String(j.id) ? 'Seleccionado' : 'Clic para jugar'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIAL DE MIS APUESTAS */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mi Historial de Apuestas</h3>
          <span className="badge badge-gold">{misApuestas.length} apuestas</span>
        </div>

        {misApuestas.length > 0 ? (
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
                {misApuestas.map(a => (
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
            <p>Aún no has realizado ninguna apuesta. ¡Prueba tu suerte!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Apuestas;
