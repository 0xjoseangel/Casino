import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function PromocionesAdmin() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalInscritos, setModalInscritos] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'Bono de Bienvenida',
    fecha_inicio: '',
    fecha_fin: '',
    condiciones: '',
    beneficio: '10%',
    max_jugadores: 0,
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

    if (form.fecha_inicio && form.fecha_fin) {
      if (new Date(form.fecha_fin) < new Date(form.fecha_inicio)) {
        alert('Error: La fecha de fin no puede ser anterior a la fecha de inicio');
        return;
      }
    }

    const res = await postData('eventos/promociones/', form);
    if (res && res.id) {
      alert('Promoción creada correctamente');
      setForm({
        nombre: '',
        tipo: 'Bono de Bienvenida',
        fecha_inicio: '',
        fecha_fin: '',
        condiciones: '',
        beneficio: '10%',
        max_jugadores: 0,
        estado: false
      });
      cargarDatos();
    } else {
      const mensaje = res?.fecha_fin?.[0] || res?.nombre?.[0] || res?.detail || 'Error al crear. Revisa los campos.';
      alert(mensaje);
    }
  };

  const habilitarPromo = async (id) => {
    const res = await postData(`eventos/promociones/${id}/habilitar/`, {});
    if (res && !res.error) {
      // Actualizar estado local inmediatamente
      setPromos(prev => prev.map(p =>
        p.id === id ? { ...p, estado: true } : p
      ));
    } else {
      alert(res?.error || 'Error al habilitar');
    }
  };

  const finalizarPromo = async (id) => {
    const res = await postData(`eventos/promociones/${id}/finalizar/`, {});
    if (res && !res.error) {
      // Actualizar estado local inmediatamente
      setPromos(prev => prev.map(p =>
        p.id === id ? { ...p, estado: false } : p
      ));
    } else {
      alert(res?.error || 'Error al finalizar');
    }
  };

  // Ver jugadores inscritos en la promoción
  const verInscritos = async (id) => {
    const res = await getData(`eventos/promociones/${id}/inscritos/`);
    if (res && !res.error) {
      setModalInscritos(res);
    } else {
      alert('Error al cargar los inscritos');
    }
  };

  const cerrarModal = () => {
    setModalInscritos(null);
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
              placeholder="Ej: Bono de Bienvenida Enero"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} required>
              <option value="Bono de Bienvenida">Bono de Bienvenida</option>
              <option value="Tiradas Gratis">Tiradas Gratis</option>
              <option value="Cashback">Cashback</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Condiciones/Requisitos</label>
            <textarea
              name="condiciones"
              placeholder="Describe las condiciones de la promoción..."
              value={form.condiciones}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Beneficio</label>
            <input
              name="beneficio"
              placeholder="Ej: 10% o 20€"
              value={form.beneficio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Máx. Jugadores (0 = ilimitado)</label>
            <input
              name="max_jugadores"
              type="number"
              min="0"
              placeholder="0"
              value={form.max_jugadores}
              onChange={handleChange}
            />
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
                  <th>Tipo</th>
                  <th>Beneficio</th>
                  <th>Fechas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td><span className="text-gold">{p.tipo}</span></td>
                    <td>{p.beneficio}</td>
                    <td className="text-muted">{p.fecha_inicio} - {p.fecha_fin}</td>
                    <td>
                      <span className={`badge ${p.estado ? 'badge-success' : 'badge-error'}`}>
                        {p.estado ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                        <button
                          onClick={() => verInscritos(p.id)}
                          className="btn btn-gold btn-sm"
                        >
                          Ver Inscritos
                        </button>
                        {!p.estado ? (
                          <button
                            onClick={() => habilitarPromo(p.id)}
                            className="btn btn-neon btn-sm"
                          >
                            Habilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => finalizarPromo(p.id)}
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
            <div className="icon">🎁</div>
            <p>No hay promociones registradas.</p>
          </div>
        )}
      </div>

      {/* MODAL DE INSCRITOS */}
      {modalInscritos && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Jugadores Inscritos - {modalInscritos.promocion}</h3>
              <button className="modal-close" onClick={cerrarModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="mb-lg">
                <span>Total inscritos: <strong className="text-gold">{modalInscritos.total_inscritos}</strong></span>
              </div>

              {modalInscritos.inscritos.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Fecha Inscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalInscritos.inscritos.map((j, idx) => (
                      <tr key={idx}>
                        <td>{j.dni}</td>
                        <td>{j.nombre} {j.apellidos}</td>
                        <td>{j.email}</td>
                        <td>{new Date(j.fecha_inscripcion).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>No hay jugadores inscritos en esta promoción.</p>
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

export default PromocionesAdmin;
