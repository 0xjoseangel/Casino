import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function PromocionesAdmin() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    descuento: 10,
    fecha_inicio: '',
    fecha_fin: '',
    estado: false
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const data = await getData('eventos/promociones/');
    if (Array.isArray(data)) setPromos(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await postData('eventos/promociones/', form);
    if (res && !res.error) {
      alert('Promoción creada');
      setForm({
        nombre: '',
        descripcion: '',
        codigo: '',
        descuento: 10,
        fecha_inicio: '',
        fecha_fin: '',
        estado: false
      });
      cargarDatos();
    } else {
      alert('Error al crear. Revisa fechas o campos.');
    }
  };

  const cambiarEstado = async (id, accion) => {
    const res = await postData(`eventos/promociones/${id}/${accion}/`, {});
    if (res) {
      alert(`Promoción ${accion === 'habilitar' ? 'habilitada' : 'finalizada'}`);
      cargarDatos();
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title gold">Gestión de Promociones</h1>
        <p className="page-subtitle">Crea y administra ofertas para los jugadores</p>
      </div>

      {/* FORMULARIO */}
      <div className="card highlight-gold">
        <div className="card-header">
          <h3 className="card-title">Nueva Promoción</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              name="nombre"
              placeholder="Ej: Bono de Bienvenida"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Código</label>
            <input
              name="codigo"
              placeholder="Ej: BONO50"
              value={form.codigo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Descripción</label>
            <textarea
              name="descripcion"
              placeholder="Describe la promoción..."
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descuento (%)</label>
            <input
              name="descuento"
              type="number"
              placeholder="10"
              value={form.descuento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado Inicial</label>
            <div className="flex gap-sm" style={{ height: '48px', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="estado"
                checked={form.estado}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              <span className="text-secondary">Activar inmediatamente</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Fecha Inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha Fin</label>
            <input
              name="fecha_fin"
              type="date"
              value={form.fecha_fin}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <button className="btn btn-full" type="submit">
              Crear Promoción
            </button>
          </div>
        </form>
      </div>

      {/* TABLA LISTADO */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Listado de Promociones</h3>
          <span className="badge badge-gold">{promos.length} promociones</span>
        </div>

        {loading ? (
          <div className="loading">Cargando promociones...</div>
        ) : promos.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td><span className="text-gold">{p.codigo}</span></td>
                    <td>{p.descuento}%</td>
                    <td className="text-muted">{p.fecha_inicio} - {p.fecha_fin}</td>
                    <td>
                      <span className={`badge ${p.estado ? 'badge-success' : 'badge-error'}`}>
                        {p.estado ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>
                    <td>
                      {!p.estado ? (
                        <button
                          onClick={() => cambiarEstado(p.id, 'habilitar')}
                          className="btn btn-neon btn-sm"
                        >
                          Habilitar
                        </button>
                      ) : (
                        <button
                          onClick={() => cambiarEstado(p.id, 'finalizar')}
                          className="btn btn-secondary btn-sm"
                        >
                          Finalizar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">🎁</div>
            <p>No hay promociones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromocionesAdmin;
