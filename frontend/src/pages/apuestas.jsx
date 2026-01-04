import { useEffect, useState } from 'react';
// 1. IMPORTAMOS LAS FUNCIONES DE TU COMPAÑERO
import { getData, postData } from '../services/api';

function Apuestas() {
  const [apuestas, setApuestas] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [juegos, setJuegos] = useState([]);
  
  const [form, setForm] = useState({
    usuario: '',
    juego: '',
    cantidad_apostada: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // 2. USAMOS getData EN LUGAR DE api.get
    const resApuestas = await getData('/movimientos/apuestas/');
    if (resApuestas && !resApuestas.error) setApuestas(resApuestas);

    const resJug = await getData('/usuarios/jugadores/');
    if (resJug && !resJug.error) setJugadores(resJug);

    const resJuegos = await getData('/juegos/juegos/');
    if (resJuegos && !resJuegos.error) {
        setJuegos(resJuegos);
    } else {
        // Fallback por si acaso
        setJuegos([{id: 1, nombre: 'Ruleta'}, {id: 2, nombre: 'Blackjack'}]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. USAMOS postData EN LUGAR DE api.post
    const resultado = await postData('/movimientos/apuestas/', form);

    if (resultado && !resultado.error) {
        alert('✅ Apuesta realizada con éxito');
        setForm({ ...form, cantidad_apostada: '' });
        cargarDatos(); 
    } else {
        // postData suele devolver el error dentro del objeto
        alert('❌ Error al apostar. Revisa el saldo o los datos.');
    }
  };

  return (
    <div className="card">
      <h2>🎰 Mesa de Juego (Apuestas)</h2>

      {/* FORMULARIO */}
      <div style={{ background: '#2c3e50', padding: '20px', borderRadius: '10px', marginBottom: '20px', color: 'white' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          
          <div>
            <label>Jugador:</label><br/>
            <select 
              value={form.usuario} 
              onChange={(e) => setForm({...form, usuario: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px' }}
            >
              <option value="">-- Elige quién juega --</option>
              {jugadores.map(j => (
                <option key={j.id} value={j.id}>{j.nombre} (Saldo: {j.cartera_monetaria}€)</option>
              ))}
            </select>
          </div>

          <div>
            <label>Juego:</label><br/>
            <select 
              value={form.juego} 
              onChange={(e) => setForm({...form, juego: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px' }}
            >
              <option value="">-- Elige juego --</option>
              {juegos.map(j => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Apuesta (€):</label><br/>
            <input 
              type="number" 
              value={form.cantidad_apostada}
              onChange={(e) => setForm({...form, cantidad_apostada: e.target.value})}
              required 
              style={{ padding: '8px', borderRadius: '4px', width: '100px' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            APOSTAR
          </button>
        </form>
      </div>

      {/* HISTORIAL */}
      <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#ecf0f1' }}>
            <th style={{ padding: '10px' }}>Fecha</th>
            <th style={{ padding: '10px' }}>Jugador</th>
            <th style={{ padding: '10px' }}>Juego</th>
            <th style={{ padding: '10px' }}>Apostado</th>
            <th style={{ padding: '10px' }}>Premio</th>
          </tr>
        </thead>
        <tbody>
          {apuestas.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{new Date(a.fecha).toLocaleString()}</td>
              <td style={{ padding: '10px' }}>{a.usuario}</td>
              <td style={{ padding: '10px' }}>{a.juego}</td>
              <td style={{ padding: '10px', color: '#e74c3c' }}>-{a.cantidad_apostada}€</td>
              <td style={{ padding: '10px', color: a.ganancia > 0 ? '#27ae60' : 'black', fontWeight: 'bold' }}>
                {a.ganancia > 0 ? `+${a.ganancia}€` : '0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Apuestas;