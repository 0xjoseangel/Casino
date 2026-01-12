import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Sesiones() {
  const ENDPOINT_LISTADO = 'sesiones/listado/';
  const ENDPOINT_INICIAR = 'sesiones/iniciar/';
  const ENDPOINT_DETALLE = 'sesiones/historial/';

  const [listaSesiones, setListaSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState({
    saldo_inicio: '',
    regla1_limite_gasto_diario: '',
    regla2_limite_operaciones_hora: '',
  });

  useEffect(() => {
    cargarListaSesiones();
  }, []);

  const cargarListaSesiones = async () => {
    const data = await getData(ENDPOINT_LISTADO);
    if (Array.isArray(data)) {
      setListaSesiones(data);
    }
    setLoadingList(false);
  };

  const cargarDetalleSesion = async (id) => {
    const data = await getData(`${ENDPOINT_DETALLE}${id}/`);
    if (data && !data.error) {
      setSesionSeleccionada(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData(ENDPOINT_INICIAR, form);

    if (resultado && !resultado.error) {
      alert('Sesión iniciada correctamente');
      cargarListaSesiones();
      setForm({ saldo_inicio: '', regla1_limite_gasto_diario: '', regla2_limite_operaciones_hora: '' });
    } else {
      alert('Error: ' + JSON.stringify(resultado));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calcularBalance = (inicial, final) => {
    if (final === null || final === undefined) return "En curso";
    return (parseFloat(final) - parseFloat(inicial)).toFixed(2) + " €";
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title gold">Gestión de Sesiones</h1>
        <p className="page-subtitle">Control de juego responsable y seguimiento de actividad</p>
      </div>

      {/* FORMULARIO DE INICIO */}
      <div className="card highlight-gold">
        <div className="card-header">
          <h3 className="card-title">Iniciar Nueva Sesión</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Saldo Inicial (€)</label>
            <input
              name="saldo_inicio"
              type="number"
              value={form.saldo_inicio}
              onChange={handleChange}
              placeholder="100.00"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Límite Gasto Diario (€)</label>
            <input
              name="regla1_limite_gasto_diario"
              type="number"
              value={form.regla1_limite_gasto_diario}
              onChange={handleChange}
              placeholder="50.00"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Límite Operaciones/Hora</label>
            <input
              name="regla2_limite_operaciones_hora"
              type="number"
              value={form.regla2_limite_operaciones_hora}
              onChange={handleChange}
              placeholder="10"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-full" type="submit">
              Comenzar Sesión
            </button>
          </div>
        </form>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* LISTADO */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Historial</h3>
            <span className="badge badge-gold">{listaSesiones.length}</span>
          </div>

          {loadingList ? (
            <div className="loading">Cargando...</div>
          ) : listaSesiones.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {listaSesiones.map(sesion => (
                <div
                  key={sesion.id}
                  onClick={() => cargarDetalleSesion(sesion.id)}
                  className="stat-card"
                  style={{ cursor: 'pointer', marginBottom: '8px' }}
                >
                  <div className="flex-between">
                    <div>
                      <div className="text-secondary">{sesion.fecha_actual}</div>
                      <div className="text-muted">{sesion.hora_inicio}</div>
                    </div>
                    <span className={`badge ${sesion.activa ? 'badge-success' : 'badge-info'}`}>
                      {sesion.activa ? 'ACTIVA' : 'CERRADA'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay sesiones registradas.</p>
            </div>
          )}
        </div>

        {/* DETALLE */}
        <div className="card">
          {sesionSeleccionada ? (
            <>
              <div className="card-header">
                <h3 className="card-title">Sesión #{sesionSeleccionada.id}</h3>
                <span className={`badge ${sesionSeleccionada.activa ? 'badge-success' : 'badge-info'}`}>
                  {sesionSeleccionada.activa ? 'En curso' : 'Finalizada'}
                </span>
              </div>

              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <h3>Saldo Inicial</h3>
                  <p className="stat-number">{sesionSeleccionada.saldo_inicio}€</p>
                </div>
                <div className="stat-card">
                  <h3>Saldo Final</h3>
                  <p className="stat-number">
                    {sesionSeleccionada.saldo_final !== null ? `${sesionSeleccionada.saldo_final}€` : '---'}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Balance Neto</h3>
                  <p className="stat-number gold">
                    {calcularBalance(sesionSeleccionada.saldo_inicio, sesionSeleccionada.saldo_final)}
                  </p>
                </div>
              </div>

              <h4 className="section-title">Historial de Jugadas</h4>
              {sesionSeleccionada.juegos_jugados && sesionSeleccionada.juegos_jugados.length > 0 ? (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Juego</th>
                        <th>Hora</th>
                        <th>Apostado</th>
                        <th>Ganado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sesionSeleccionada.juegos_jugados.map((juego, idx) => (
                        <tr key={idx}>
                          <td>{juego.juego_nombre}</td>
                          <td>{new Date(juego.fecha).toLocaleTimeString()}</td>
                          <td className="text-gold">-{juego.cantidad_apostada}€</td>
                          <td className="text-neon">+{juego.ganancia}€</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay jugadas registradas en esta sesión.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="icon">👈</div>
              <p>Selecciona una sesión para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sesiones;
