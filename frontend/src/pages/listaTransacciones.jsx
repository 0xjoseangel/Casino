import { useEffect, useState } from 'react';
// 1. IMPORTAMOS IGUAL QUE EN SESIONES
import { getData, postData } from '../services/api';

function ListaTransacciones() {
  const [transacciones, setTransacciones] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  
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
      // 2. USAMOS getData
      const resTrans = await getData('/movimientos/transacciones/');
      if (resTrans && !resTrans.error) setTransacciones(resTrans);

      const resJug = await getData('/usuarios/jugadores/');
      if (resJug && !resJug.error) setJugadores(resJug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. USAMOS postData
    const resultado = await postData('/movimientos/transacciones/', form);

    if (resultado && !resultado.error) {
        alert('✅ Operación realizada con éxito');
        setForm({ ...form, cantidad: '', destinatario: '' });
        cargarDatos(); 
    } else {
        alert('❌ Error en la operación. Revisa los datos.');
    }
  };

  return (
    <div className="card">
      <h2>💸 Cajero y Movimientos</h2>

      {/* --- FORMULARIO DE OPERACIONES --- */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Nueva Operación</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', alignItems: 'end' }}>
          
          <div>
            <label style={{display:'block', marginBottom: 5, fontWeight:'bold'}}>Jugador:</label>
            <select 
              value={form.usuario} 
              onChange={(e) => setForm({...form, usuario: e.target.value})}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Seleccionar --</option>
              {jugadores.map(j => (
                <option key={j.id} value={j.id}>
                  {j.nombre} {j.apellidos} ({j.cartera_monetaria}€)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{display:'block', marginBottom: 5, fontWeight:'bold'}}>Tipo:</label>
            <select 
              value={form.tipo} 
              onChange={(e) => setForm({...form, tipo: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="DEPOSITO">📥 Depósito</option>
              <option value="RETIRO">📤 Retiro</option>
              <option value="TRANSFERENCIA">➡️ Transferencia</option>
            </select>
          </div>

          <div>
            <label style={{display:'block', marginBottom: 5, fontWeight:'bold'}}>Cantidad (€):</label>
            <input 
              type="number" 
              step="0.01"
              value={form.cantidad}
              onChange={(e) => setForm({...form, cantidad: e.target.value})}
              required 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          {form.tipo === 'TRANSFERENCIA' && (
            <div>
              <label style={{display:'block', marginBottom: 5, fontWeight:'bold'}}>Destinatario:</label>
              <select 
                value={form.destinatario} 
                onChange={(e) => setForm({...form, destinatario: e.target.value})}
                required={form.tipo === 'TRANSFERENCIA'}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Enviar a --</option>
                {jugadores.map(j => (
                  j.id !== parseInt(form.usuario) && (
                    <option key={j.id} value={j.id}>{j.nombre} {j.apellidos}</option>
                  )
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            style={{ padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            CONFIRMAR
          </button>
        </form>
      </div>

      {/* --- TABLA DE HISTORIAL --- */}
      <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
            <th style={{ padding: '10px' }}>Fecha</th>
            <th style={{ padding: '10px' }}>Tipo</th>
            <th style={{ padding: '10px' }}>Cantidad</th>
            <th style={{ padding: '10px' }}>Usuario</th>
            <th style={{ padding: '10px' }}>Info Extra</th>
          </tr>
        </thead>
        <tbody>
          {transacciones.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{new Date(t.fecha).toLocaleString()}</td>
              <td style={{ padding: '10px' }}>{t.tipo}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>{t.cantidad}€</td>
              <td style={{ padding: '10px' }}>{t.usuario}</td>
              <td style={{ padding: '10px', fontSize: '0.9em', color: '#666' }}>
                {t.destinatario ? `➡ Envía a: ${t.destinatario}` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListaTransacciones;