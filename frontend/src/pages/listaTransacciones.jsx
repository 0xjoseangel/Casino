import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function ListaTransacciones() {
  const [transacciones, setTransacciones] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    usuario: '',
    tipo: 'DEPOSITO',
    cantidad: '',
    destinatario: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const resTrans = await getData('/movimientos/transacciones/');
    if (resTrans && !resTrans.error) setTransacciones(resTrans);

    const resJug = await getData('/usuarios/jugadores/');
    if (resJug && !resJug.error) setJugadores(resJug);

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData('/movimientos/transacciones/', form);

    if (resultado && !resultado.error) {
      alert('Operación realizada con éxito');
      setForm({ ...form, cantidad: '', destinatario: '' });
      cargarDatos();
    } else {
      alert('Error en la operación. Revisa los datos.');
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'DEPOSITO': return '📥';
      case 'RETIRO': return '📤';
      case 'TRANSFERENCIA': return '➡️';
      default: return '💰';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title gold">Cajero y Movimientos</h1>
        <p className="page-subtitle">Gestiona depósitos, retiros y transferencias</p>
      </div>

      {/* FORMULARIO */}
      <div className="card highlight-gold">
        <div className="card-header">
          <h3 className="card-title">Nueva Operación</h3>
        </div>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Jugador</label>
            <select
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
              required
            >
              <option value="">Seleccionar jugador</option>
              {jugadores.map(j => (
                <option key={j.id} value={j.id}>
                  {j.nombre} {j.apellidos} ({j.cartera_monetaria}€)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Operación</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="DEPOSITO">📥 Depósito</option>
              <option value="RETIRO">📤 Retiro</option>
              <option value="TRANSFERENCIA">➡️ Transferencia</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad (€)</label>
            <input
              type="number"
              step="0.01"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          {form.tipo === 'TRANSFERENCIA' && (
            <div className="form-group">
              <label className="form-label">Destinatario</label>
              <select
                value={form.destinatario}
                onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                required={form.tipo === 'TRANSFERENCIA'}
              >
                <option value="">Seleccionar destinatario</option>
                {jugadores.map(j => (
                  j.id !== parseInt(form.usuario) && (
                    <option key={j.id} value={j.id}>
                      {j.nombre} {j.apellidos}
                    </option>
                  )
                ))}
              </select>
            </div>
          )}

          <div className={form.tipo === 'TRANSFERENCIA' ? '' : 'form-group'}>
            <label className="form-label">&nbsp;</label>
            <button type="submit" className="btn btn-full">
              Confirmar Operación
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIAL */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historial de Transacciones</h3>
          <span className="badge badge-gold">{transacciones.length} movimientos</span>
        </div>

        {loading ? (
          <div className="loading">Cargando transacciones...</div>
        ) : transacciones.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                  <th>Info</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.fecha).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-gold">
                        {getTipoIcon(t.tipo)} {t.tipo}
                      </span>
                    </td>
                    <td className="text-gold">{t.cantidad}€</td>
                    <td>{t.usuario}</td>
                    <td className="text-muted">
                      {t.destinatario ? `Envía a: ${t.destinatario}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>No hay transacciones registradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaTransacciones;
