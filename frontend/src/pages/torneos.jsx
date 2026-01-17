import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInscritos, setModalInscritos] = useState(null); // Para mostrar modal de inscritos
  const [form, setForm] = useState({
    nombre: '',
    juego: '',
    fecha_inicio: '',
    hora_inicio: '10:00',
    aforo_maximo: 100,
    precio_inscripcion: 0,
    reglas: 'Reglas estándar',
    premio: '1000€',
    estado: 'programado'
  });

  useEffect(() => {
    cargarTorneos();
    cargarJuegos();
  }, []);

  const cargarJuegos = async () => {
    const data = await getData('juegos/juegos/');
    if (Array.isArray(data) && data.length > 0) {
      setJuegos(data);
    }
  };

  const cargarTorneos = async () => {
    const data = await getData('eventos/torneos/');
    if (Array.isArray(data)) {
      setTorneos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(form.precio_inscripcion) < 0) {
      alert('El precio de inscripción no puede ser negativo');
      return;
    }

    if (parseInt(form.aforo_maximo) <= 0) {
      alert('El aforo máximo debe ser mayor que 0');
      return;
    }

    const resultado = await postData('eventos/torneos/', form);

    if (resultado && resultado.id) {
      alert('Torneo creado con éxito');
      setForm({
        nombre: '',
        juego: '',
        fecha_inicio: '',
        hora_inicio: '10:00',
        aforo_maximo: 100,
        precio_inscripcion: 0,
        reglas: 'Reglas estándar',
        premio: '1000€',
        estado: 'programado'
      });
      cargarTorneos();
    } else {
      const mensaje = resultado?.precio_inscripcion?.[0] ||
                     resultado?.aforo_maximo?.[0] ||
                     resultado?.juego?.[0] ||
                     resultado?.nombre?.[0] ||
                     'Error al crear el torneo. Revisa los campos.';
      alert(mensaje);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const finalizarTorneo = async (id) => {
    const res = await postData(`eventos/torneos/${id}/finalizar/`, {});
    if (res && !res.error) {
      alert(res.mensaje || 'Torneo finalizado correctamente');
      cargarTorneos();
    } else {
      alert(res?.error || 'Error al finalizar el torneo');
    }
  };

  const abrirTorneo = async (id) => {
    const res = await postData(`eventos/torneos/${id}/abrir/`, {});
    if (res && !res.error) {
      alert(res.mensaje || 'Inscripciones abiertas');
      cargarTorneos();
    } else {
      alert(res?.error || 'Error al abrir inscripciones');
    }
  };

  // Ver jugadores inscritos
  const verInscritos = async (id) => {
    const res = await getData(`eventos/torneos/${id}/inscritos/`);
    if (res && !res.error) {
      setModalInscritos(res);
    } else {
      alert('Error al cargar los inscritos');
    }
  };

  const cerrarModal = () => {
    setModalInscritos(null);
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      'programado': 'badge-info',
      'abierto': 'badge-success',
      'en curso': 'badge-warning',
      'finalizado': 'badge-error'
    };
    return estilos[estado] || 'badge-info';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title gold">Gestión de Torneos</h1>
        <p className="page-subtitle">Crea y administra los torneos del casino</p>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Nuevo Torneo</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre del Torneo</label>
            <input
              name="nombre"
              placeholder="Ej: Torneo de Poker Nocturno"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Juego</label>
            <select
              name="juego"
              value={form.juego}
              onChange={handleChange}
              required
            >
              <option value="">-- Selecciona un juego --</option>
              {juegos.map(j => (
                <option key={j.id} value={j.id}>
                  {j.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de Inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hora de Inicio</label>
            <input
              name="hora_inicio"
              type="time"
              value={form.hora_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio Inscripción (€)</label>
            <input
              name="precio_inscripcion"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.precio_inscripcion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aforo Máximo</label>
            <input
              name="aforo_maximo"
              type="number"
              min="1"
              placeholder="100"
              value={form.aforo_maximo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Premio</label>
            <input
              name="premio"
              placeholder="Ej: 500€"
              value={form.premio}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado Inicial</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="programado">Programado</option>
              <option value="abierto">Abierto</option>
              <option value="en curso">En Curso</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          <div className="full-width">
            <button className="btn btn-full" type="submit">
              Crear Torneo
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE TORNEOS */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Listado de Torneos</h3>
          <span className="badge badge-gold">{torneos.length} torneos</span>
        </div>

        {loading ? (
          <div className="loading">Cargando torneos...</div>
        ) : torneos.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                  <th>Precio</th>
                  <th>Aforo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.nombre}</td>
                    <td>{t.fecha_inicio}</td>
                    <td>{t.precio_inscripcion}€</td>
                    <td>{t.aforo_maximo}</td>
                    <td>
                      <span className={`badge ${getEstadoBadge(t.estado)}`}>
                        {t.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        <button
                          onClick={() => verInscritos(t.id)}
                          className="btn btn-gold btn-sm"
                        >
                          Ver Inscritos
                        </button>
                        {t.estado === 'programado' && (
                          <button
                            onClick={() => abrirTorneo(t.id)}
                            className="btn btn-neon btn-sm"
                          >
                            Abrir
                          </button>
                        )}
                        {t.estado !== 'finalizado' && (
                          <button
                            onClick={() => finalizarTorneo(t.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            Finalizar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🏆</div>
            <p>No hay torneos registrados todavía.</p>
          </div>
        )}
      </div>

      {/* MODAL DE INSCRITOS */}
      {modalInscritos && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Jugadores Inscritos - {modalInscritos.torneo}</h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="flex-between mb-lg">
                <span>Total inscritos: <strong>{modalInscritos.total_inscritos}</strong></span>
                <span>Plazas disponibles: <strong className="text-gold">{modalInscritos.plazas_disponibles}</strong></span>
              </div>

              {modalInscritos.inscritos.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Posición</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalInscritos.inscritos.map((j, idx) => (
                      <tr key={idx}>
                        <td>{j.dni}</td>
                        <td>{j.nombre} {j.apellidos}</td>
                        <td>{j.email}</td>
                        <td>{j.posicion || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No hay jugadores inscritos todavía.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estilos del modal inline */}
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-card);
          border-radius: 12px;
          max-width: 700px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid var(--border);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header h3 {
          margin: 0;
          color: var(--gold);
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }
        .modal-close:hover {
          color: var(--text);
        }
        .modal-body {
          padding: 20px;
        }
        .btn-gold {
          background: linear-gradient(135deg, var(--gold), #b8860b);
          color: #000;
        }
        .btn-gold:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

export default Torneos;
