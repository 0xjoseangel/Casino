import React, { useState, useEffect } from 'react';
import { getData } from '../services/api';

const JuegosAdmin = () => {
  const [juegos, setJuegos] = useState([]);
  const [tab, setTab] = useState('consultar'); 
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const [formJuego, setFormJuego] = useState({
    id: null,
    nombre: '',
    tipo: 'tragaperras',
    apuesta_minima: 1,
    apuesta_maxima: 100,
    estado: true,
    descripcion: ''
  });

  useEffect(() => {
    if (tab === 'consultar') {
      fetchJuegos();
    }
  }, [tab]);

  const fetchJuegos = async () => {
    setLoading(true);
    const res = await getData('juegos/juegos/?admin=true');
    if (res && !res.error) {
      setJuegos(Array.isArray(res) ? res : (res.results || []));
    }
    setLoading(false);
  };

  const prepararEdicion = (juego) => {
    setFormJuego(juego);
    setTab('editar');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const esEdicion = tab === 'editar';
    
    const url = esEdicion 
      ? `http://127.0.0.1:8000/api/juegos/juegos/${formJuego.id}/?admin=true` 
      : `http://127.0.0.1:8000/api/juegos/juegos/`;
    
    try {
      const response = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formJuego)
      });

      if (response.ok) {
        setMensaje({ 
          texto: `✅ Juego ${esEdicion ? 'actualizado' : 'creado'} correctamente en el sistema`, 
          tipo: 'success' 
        });
        setTab('consultar');
        setFormJuego({ nombre: '', tipo: 'tragaperras', apuesta_minima: 1, apuesta_maxima: 100, estado: true, descripcion: '' });
      } else {
        const errData = await response.json();
        setMensaje({ texto: `❌ Error de validación: ${JSON.stringify(errData)}`, tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: '❌ No hay conexión con el servidor Django', tipo: 'error' });
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <header className="page-header text-center">
        <h1 className="gold">🎰 Gestión de Juegos (Admin)</h1>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => setTab('consultar')} className={`btn ${tab === 'consultar' ? 'btn-primary' : 'btn-secondary'}`}>Inventario Completo</button>
          <button onClick={() => { setTab('añadir'); setFormJuego({ nombre: '', tipo: 'tragaperras', apuesta_minima: 1, apuesta_maxima: 100, estado: true, descripcion: '' }); }} className={`btn ${tab === 'añadir' ? 'btn-primary' : 'btn-secondary'}`}>Nuevo Juego</button>
        </div>
      </header>

      {mensaje.texto && <div className={`badge ${mensaje.tipo === 'success' ? 'badge-success' : 'badge-error'}`} style={{ width: '100%', padding: '10px', margin: '20px 0' }}>{mensaje.texto}</div>}

      {tab === 'consultar' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre / Tipo</th>
                  <th>Rentabilidad</th> 
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {juegos.length > 0 ? juegos.map(j => (
                  <tr key={j.id} style={{ opacity: j.estado ? 1 : 0.6 }}>
                    <td><strong>{j.nombre}</strong><br/><small>{j.tipo}</small></td>
                    {/* Nueva celda de rentabilidad */}
                    <td style={{ 
                      fontWeight: 'bold', 
                      color: j.rentabilidad >= 0 ? '#2ecc71' : '#e74c3c' 
                    }}>
                      {j.rentabilidad !== undefined ? `${j.rentabilidad}€` : '0.00€'}
                    </td>
                    <td>
                      <span className={`badge ${j.estado ? 'badge-success' : 'badge-error'}`}>
                        {j.estado ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => prepararEdicion(j)} className="btn btn-sm btn-primary">Modificar</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4">No hay juegos que mostrar</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(tab === 'añadir' || tab === 'editar') && (
        <div className="card highlight-gold">
          <h3>{tab === 'añadir' ? 'Registrar Nuevo' : `Editar: ${formJuego.nombre}`}</h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input type="text" className="form-control" value={formJuego.nombre} onChange={(e) => setFormJuego({...formJuego, nombre: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={formJuego.tipo} onChange={(e) => setFormJuego({...formJuego, tipo: e.target.value})}>
                <option value="tragaperras">Tragaperras</option>
                <option value="ruleta">Ruleta</option>
                <option value="cartas">Cartas</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={formJuego.estado} onChange={(e) => setFormJuego({...formJuego, estado: e.target.value === 'true'})}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" value={formJuego.descripcion} onChange={(e) => setFormJuego({...formJuego, descripcion: e.target.value})} required style={{minHeight: '80px', background: '#111', color: '#fff'}} />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              {tab === 'añadir' ? 'GUARDAR EN BACKEND' : 'ACTUALIZAR EN BACKEND'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default JuegosAdmin;