import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function ListaTransacciones() {
  const [transacciones, setTransacciones] = useState([]);
  const [apuestas, setApuestas] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para saber si soy admin y filtrar
  const [esAdmin, setEsAdmin] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState('');

  const [form, setForm] = useState({
    usuario: '',
    tipo: 'DEPOSITO',
    cantidad: '',
    destinatario: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [filtroUsuario]); // Recargar si cambia el filtro

  const cargarDatos = async () => {
    // Obtener info del usuario local
    const usuarioGuardado = localStorage.getItem('casino_usuario');
    let queryParams = '';
    let isAdmin = false;

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      isAdmin = usuario.rol === 'admin';
      setEsAdmin(isAdmin);

      // CONSTRUIR QUERY
      if (isAdmin) {
        queryParams = `?rol=admin`;
        if (filtroUsuario) {
          queryParams += `&usuario=${filtroUsuario}`;
        }
      } else {
        queryParams = `?usuario=${usuario.dni}`;
      }
    }

    // 1. Cargar Transacciones
    const resTrans = await getData(`movimientos/transacciones/${queryParams}`);
    if (resTrans && Array.isArray(resTrans)) {
      setTransacciones(resTrans);
    } else {
      setTransacciones([]);
    }

    // 2. Cargar Apuestas (Solo Admin)
    if (isAdmin) {
      const resApuestas = await getData(`movimientos/apuestas/${queryParams}`);
      if (resApuestas && Array.isArray(resApuestas)) {
        setApuestas(resApuestas);
      } else {
        setApuestas([]);
      }
    } else {
      setApuestas([]);
    }

    const resJug = await getData('usuarios/jugadores/');
    if (resJug && !resJug.error) setJugadores(resJug);

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData('movimientos/transacciones/', form);

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

      {/* FILTRO SOLO PARA ADMIN */}
      {esAdmin && (
        <>
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #ffd700' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#ffd700' }}>👮 Panel de Admin: Filtrar por Jugador</label>
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="form-control"
              >
                <option value="">-- Ver Todos los Movimientos --</option>
                {jugadores.map(j => (
                  <option key={j.dni} value={j.dni}>
                    {j.nombre} {j.apellidos} ({j.dni})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtroUsuario && jugadores.find(j => j.dni === filtroUsuario) && (
            <div className="card fade-in" style={{ marginBottom: '20px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700' }}>
              <div className="card-header">
                <h3 className="card-title">👤 Información del Jugador</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Nombre:</strong> <br />
                  {jugadores.find(j => j.dni === filtroUsuario).nombre} {jugadores.find(j => j.dni === filtroUsuario).apellidos}
                </div>
                <div>
                  <strong>DNI:</strong> <br />
                  {jugadores.find(j => j.dni === filtroUsuario).dni}
                </div>
                <div>
                  <strong>Email:</strong> <br />
                  {jugadores.find(j => j.dni === filtroUsuario).email}
                </div>
                <div>
                  <strong>Saldo Actual:</strong> <br />
                  <span className="text-gold" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {jugadores.find(j => j.dni === filtroUsuario).cartera_monetaria}€
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* FORMULARIO: SOLO SI NO ES ADMIN */}
      {!esAdmin && (
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
                  <option key={j.dni} value={j.dni}>
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
                    j.dni !== form.usuario && (
                      <option key={j.dni} value={j.dni}>
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
      )}

      {/* HISTORIAL */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Historial de Transacciones</h3>
          <span className="badge badge-gold">{transacciones.length} movimientos</span>
        </div>

        {loading ? (
          <div className="loading">Cargando transacciones...</div>
        ) : transacciones.length > 0 ? (
          <>
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
                        {t.destinatario ? `Envía a: ${t.destinatario} ` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="icon">💸</div>
            <p>No hay transacciones registradas.</p>
          </div>
        )}
      </div>

      {/* HISTORIAL DE APUESTAS (SEPARADO) - SOLO ADMIN */}
      {esAdmin && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Historial de Apuestas (Admin)</h3>
            <span className="badge badge-info">{apuestas.length} jugadas</span>
          </div>

          {loading ? (
            <div className="loading">Cargando apuestas...</div>
          ) : apuestas.length > 0 ? (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Jugador</th>
                      <th>Juego</th>
                      <th>Apostado</th>
                      <th>Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apuestas.map(a => (
                      <tr key={a.id}>
                        <td>{new Date(a.fecha).toLocaleString()}</td>
                        <td>{a.usuario}</td>
                        <td>{a.juego_nombre || a.juego}</td>
                        <td className="text-muted">-{a.cantidad_apostada}€</td>
                        <td>
                          <span className={a.ganancia > 0 ? 'badge badge-success' : 'badge badge-error'}>
                            {a.ganancia > 0 ? `+${a.ganancia}€` : '0€'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No hay apuestas registradas con este filtro.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListaTransacciones;
