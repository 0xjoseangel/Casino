import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Sesiones() { 
  
  const ENDPOINT_LISTADO = 'sesiones/listado/';
  const ENDPOINT_INICIAR = 'sesiones/iniciar/';
  const ENDPOINT_DETALLE = 'sesiones/historial/'; 
  const ENDPOINT_JUGADORES = 'sesiones/jugadores-dropdown/'; // <--- NUEVA URL

  const [listaSesiones, setListaSesiones] = useState([]);
  const [listaJugadores, setListaJugadores] = useState([]); // <--- ESTADO PARA EL DESPLEGABLE
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  
  const [form, setForm] = useState({
    dni_jugador: '', 
    saldo_inicio: '', 
    regla1_limite_gasto_diario: '',
    regla2_limite_operaciones_hora: '',
  });

  useEffect(() => {
    cargarListaSesiones();
    cargarJugadores(); // <--- CARGAMOS LOS JUGADORES AL ENTRAR
  }, []);

  const cargarListaSesiones = async () => {
    const data = await getData(ENDPOINT_LISTADO);
    if (Array.isArray(data)) setListaSesiones(data);
    setLoadingList(false);
  };

  // <--- NUEVA FUNCIÓN PARA TRAER LOS DNIs
  const cargarJugadores = async () => {
    const data = await getData(ENDPOINT_JUGADORES);
    if (Array.isArray(data)) {
        setListaJugadores(data);
    }
  };

  const cargarDetalleSesion = async (id) => {
    const data = await getData(`${ENDPOINT_DETALLE}${id}/`);
    if (data && !data.error) setSesionSeleccionada(data);
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData(ENDPOINT_INICIAR, form);
    
    // CAMBIO CLAVE: Comprobamos si nos ha devuelto un ID (éxito)
    if (resultado && resultado.id) {
      alert('✅ Sesión iniciada correctamente (ID: ' + resultado.id + ')');
      cargarListaSesiones();
      setForm({ dni_jugador: '', saldo_inicio: '', regla1_limite_gasto_diario: '', regla2_limite_operaciones_hora: '' });
    } else {
      // Si no hay ID, es un error. Lo mostramos tal cual viene del servidor.
      console.error("Error al iniciar:", resultado);
      alert('❌ Error al iniciar. Revisa los datos.\n\n' + JSON.stringify(resultado, null, 2));
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{color: '#d4af37', borderBottom: '2px solid #d4af37', paddingBottom: '10px'}}>
        Gestión de Sesiones y Juego Responsable
      </h2>

      {/* FORMULARIO */}
      <div className="card" style={{ marginBottom: '20px', backgroundColor: '#222', border: '1px solid #444', color: 'white', padding: '20px', borderRadius: '8px'}}>
        <h3 style={{marginTop:0, color: '#d4af37'}}>▶ Iniciar Nueva Sesión</h3>
        
        <form onSubmit={handleSubmit} style={{display:'flex', gap:'15px', alignItems:'flex-end', flexWrap:'wrap'}}>
          
          {/* CAMPO DESPLEGABLE (SELECT) */}
          <div>
            <label style={{fontSize:'0.9em', display:'block', marginBottom:'5px', color:'#ccc'}}>
                Seleccionar Jugador
            </label>
            <select 
                name="dni_jugador" 
                value={form.dni_jugador} 
                onChange={handleChange} 
                required 
                style={{
                    padding:'8px', 
                    borderRadius:'5px', 
                    border:'none', 
                    backgroundColor:'white',
                    color:'black',
                    width: '200px', // Un poco más ancho para que quepa el nombre
                    cursor: 'pointer'
                }}
            >
                <option value="">-- Selecciona DNI --</option>
                {listaJugadores.map(jugador => (
                    <option key={jugador.id} value={jugador.dni}>
                        {jugador.dni} - {jugador.nombre} {jugador.apellidos}
                    </option>
                ))}
            </select>
          </div>

          <div>
            <label style={{fontSize:'0.9em', display:'block', marginBottom:'5px', color:'#ccc'}}>Saldo Inicial (€)</label>
            <input name="saldo_inicio" type="number" value={form.saldo_inicio} onChange={handleChange} required style={{padding:'8px', borderRadius:'5px', border:'none', width: '100px', background:'white', color:'black'}} />
          </div>
          <div>
            <label style={{fontSize:'0.9em', display:'block', marginBottom:'5px', color:'#ccc'}}>Límite Gasto (€)</label>
            <input name="regla1_limite_gasto_diario" type="number" value={form.regla1_limite_gasto_diario} onChange={handleChange} required style={{padding:'8px', borderRadius:'5px', border:'none', width: '100px', background:'white', color:'black'}} />
          </div>
          <div>
            <label style={{fontSize:'0.9em', display:'block', marginBottom:'5px', color:'#ccc'}}>Límite Ops/H</label>
            <input name="regla2_limite_operaciones_hora" type="number" value={form.regla2_limite_operaciones_hora} onChange={handleChange} required style={{padding:'8px', borderRadius:'5px', border:'none', width: '100px', background:'white', color:'black'}} />
          </div>
          
          <button className="btn" type="submit" style={{height:'35px', backgroundColor:'#d4af37', color:'black', fontWeight:'bold', border:'none', cursor:'pointer', padding:'0 20px', borderRadius:'5px'}}>
            COMENZAR
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* LISTADO */}
        <div className="card">
          <h3>📜 Historial de Sesiones</h3>
          {loadingList ? <p>Cargando...</p> : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.9em', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{textAlign:'left'}}>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {listaSesiones.map(sesion => (
                    <tr key={sesion.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{padding:'8px'}}>{sesion.fecha_actual} <br/><small style={{color:'#888'}}>{sesion.hora_inicio}</small></td>
                      <td style={{padding:'8px'}}>
                        {sesion.activa ? 
                          <span style={{color:'green', fontWeight:'bold', background:'#e6fffa', padding:'2px 5px', borderRadius:'4px'}}>ACTIVA</span> : 
                          <span style={{color:'gray'}}>CERRADA</span>
                        }
                      </td>
                      <td style={{padding:'8px'}}>
                        <button onClick={() => cargarDetalleSesion(sesion.id)} style={{cursor:'pointer', background:'#eee', border:'1px solid #ccc', borderRadius:'3px', padding:'2px 8px'}}>
                            Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETALLE */}
        <div className="card" style={{backgroundColor: '#2a2a2a', color: 'white'}}>
          {sesionSeleccionada ? (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #444', marginBottom:'15px', paddingBottom:'10px'}}>
                <h3 style={{margin:0}}>🔎 Detalle Sesión #{sesionSeleccionada.id}</h3>
                <span style={{fontSize:'0.9em', color:'#aaa'}}>
                   {sesionSeleccionada.activa ? '🟢 En curso' : '🔴 Finalizada'}
                </span>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}>
                  <small style={{color:'#888'}}>Saldo Inicial</small>
                  <div style={{fontSize:'1.4em', fontWeight:'bold'}}>{sesionSeleccionada.saldo_inicio} €</div>
                </div>
                <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}>
                  <small style={{color:'#888'}}>Saldo Final</small>
                  <div style={{fontSize:'1.4em', fontWeight:'bold'}}>
                    {sesionSeleccionada.saldo_final !== null ? sesionSeleccionada.saldo_final + ' €' : '---'}
                  </div>
                </div>
                <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}>
                  <small style={{color:'#888'}}>Balance Neto</small>
                  <div style={{fontSize:'1.4em', fontWeight:'bold', color:'#d4af37'}}>
                    {calcularBalance(sesionSeleccionada.saldo_inicio, sesionSeleccionada.saldo_final)}
                  </div>
                </div>
              </div>

              <h4>🎲 Historial de Juegos (Apuestas)</h4>
              {sesionSeleccionada.juegos_jugados && sesionSeleccionada.juegos_jugados.length > 0 ? (
                <table style={{width:'100%', fontSize:'0.9em'}}>
                  <thead style={{color:'#ccc'}}>
                    <tr>
                      <th style={{textAlign:'left'}}>Juego</th>
                      <th style={{textAlign:'left'}}>Hora</th>
                      <th style={{textAlign:'right'}}>Apostado</th>
                      <th style={{textAlign:'right'}}>Ganado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesionSeleccionada.juegos_jugados.map((juego, idx) => (
                      <tr key={idx} style={{borderBottom:'1px solid #444'}}>
                        <td style={{padding:'8px 0'}}>{juego.juego_nombre}</td>
                        <td>{new Date(juego.fecha).toLocaleTimeString()}</td>
                        <td style={{textAlign:'right', color:'#ff6b6b'}}>-{juego.cantidad_apostada} €</td>
                        <td style={{textAlign:'right', color:'#51cf66'}}>+{juego.ganancia} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{fontStyle:'italic', color:'#666', textAlign:'center', marginTop:'20px'}}>
                    No se han registrado jugadas en esta sesión aún.
                </p>
              )}
            </>
          ) : (
            <div style={{textAlign:'center', padding:'50px', color:'#666'}}>
              <p>👈 Selecciona una sesión de la lista para ver su balance y jugadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sesiones;