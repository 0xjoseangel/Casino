import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nombre: '',
    juego: 1,
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
  }, []);

  const cargarTorneos = async () => {
    const data = await getData('eventos/torneos/');
    if (Array.isArray(data)) {
      setTorneos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData('eventos/torneos/', form);

    if (resultado && !resultado.error) {
      alert('Torneo creado con éxito');
      setForm({
        nombre: '',
        juego: 1,
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
      alert('Error al crear. Revisa que el ID del Juego exista.');
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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
            <label className="form-label">ID del Juego</label>
            <input
              name="juego"
              type="number"
              placeholder="ID del juego"
              value={form.juego}
              onChange={handleChange}
              required
            />
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
              placeholder="100"
              value={form.aforo_maximo}
              onChange={handleChange}
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
            <label className="form-label">Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="programado">Programado</option>
              <option value="en_curso">En Curso</option>
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
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {torneos.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.nombre}</td>
                    <td>{t.fecha_inicio}</td>
                    <td>{t.precio_inscripcion}€</td>
                    <td>
                      <span className={`badge ${
                        t.estado === 'programado' ? 'badge-success' :
                        t.estado === 'en_curso' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {t.estado.toUpperCase()}
                      </span>
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
    </div>
  );
}

export default Torneos;
