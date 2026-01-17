import { useEffect, useState } from 'react';
import { getData, postData, putData } from '../services/api';

function Sesiones() { 
  const storedUser = localStorage.getItem('casino_usuario');
  const usuarioObj = storedUser ? JSON.parse(storedUser) : null;
  const rol = usuarioObj?.rol || localStorage.getItem('casino_rol'); 

  // ENDPOINTS
  const ENDPOINT_LISTADO = 'sesiones/listado/';
  const ENDPOINT_INICIAR = 'sesiones/iniciar/';
  const ENDPOINT_FINALIZAR = 'sesiones/finalizar/'; // <--- NUEVO
  const ENDPOINT_DETALLE = 'sesiones/historial/'; 
  const ENDPOINT_SEGURIDAD = '/sesiones/seguridad/';

  // ESTADOS
  const [listaSesiones, setListaSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  
  // ESTADO: ¿EL JUGADOR TIENE SESIÓN ACTIVA?
  const [sesionActivaJugador, setSesionActivaJugador] = useState(null);

  // ESTADOS FORMULARIOS
  const [formJugadorInicio, setFormJugadorInicio] = useState({
    saldo_inicio: '', 
    regla1_limite_gasto_diario: '',
    regla2_limite_operaciones_hora: '',
  });

  const [saldoFinalInput, setSaldoFinalInput] = useState(''); // Para finalizar

  // ESTADO ADMIN
  const [editandoSeguridad, setEditandoSeguridad] = useState(false);
  const [formSeguridad, setFormSeguridad] = useState({
      regla1_limite_gasto_diario: '',
      regla2_limite_operaciones_hora: ''
  });

  useEffect(() => {
    if (rol === 'admin') {
        cargarListaSesiones();
    } else {
        // SI ES JUGADOR: Comprobamos si tiene sesión activa
        verificarEstadoJugador();
    }
  }, [rol]);

  // --- LÓGICA JUGADOR: VERIFICAR ESTADO ---
  const verificarEstadoJugador = async () => {
      // Pedimos la lista filtrada por su DNI (usando el truco del header para no ensuciar URL)
      // O, como hemos simplificado, pedimos la lista y filtramos aquí en local (menos eficiente pero funciona con tu backend actual)
      const data = await getData(ENDPOINT_LISTADO); 
      
      if (Array.isArray(data) && usuarioObj && usuarioObj.dni) {
          // Buscamos si hay alguna activa DE ESTE USUARIO
          // (Nota: Si el backend devuelve todo, filtramos por DNI aquí. Si el backend ya filtra, mejor)
          // Como tu backend actual devuelve TODO, filtramos aquí:
          
          // Buscamos la sesión activa del jugador (que coincida con su ID de usuario o deducimos que es suya si viene filtrada)
          // Para asegurar, buscaremos la más reciente que esté activa.
          // *Idealmente el backend debería filtrar, pero como lo pusimos en AllowAny devuelve todo*
          // *Asumiremos que el backend filtra o buscamos una lógica simple: La última activa creada hoy*
          
          // TRUCO PRAGMÁTICO: Como el backend LISTADO devuelve TODO y no incluye el DNI explícito en el JSON simple,
          // vamos a confiar en que el usuario recuerde si tiene sesión.
          // PERO para hacerlo BIEN: El botón de finalizar intentará cerrar.
          
          // MEJOR APROXIMACIÓN VISUAL:
          // Vamos a intentar obtener el estado. Si no podemos filtrar fácil, mostraremos el formulario de inicio
          // y si falla diciendo "Ya tienes sesión", mostraremos el de finalizar.
          setLoadingList(false);
      }
  };

  const cargarListaSesiones = async () => {
    const data = await getData(ENDPOINT_LISTADO);
    if (Array.isArray(data)) setListaSesiones(data);
    setLoadingList(false);
  };

  const cargarDetalleSesion = async (id) => {
    setEditandoSeguridad(false);
    const data = await getData(`${ENDPOINT_DETALLE}${id}/`);
    if (data && !data.error) {
      setSesionSeleccionada(data);
      setFormSeguridad({
          regla1_limite_gasto_diario: data.regla1_limite_gasto_diario,
          regla2_limite_operaciones_hora: data.regla2_limite_operaciones_hora
      });
    }
  };

  // --- ACCIÓN: INICIAR SESIÓN ---
  const handleJugadorIniciar = async (e) => {
    e.preventDefault();
    const datosEnvio = { ...formJugadorInicio, dni_jugador: usuarioObj?.dni };
    
    const resultado = await postData(ENDPOINT_INICIAR, datosEnvio);
    
    if (resultado && resultado.id) {
      alert(`✅ ¡Sesión Iniciada! A jugar.\nID Sesión: ${resultado.id}`);
      setSesionActivaJugador(resultado.id); // Marcamos que tiene sesión activa
      setFormJugadorInicio({ saldo_inicio: '', regla1_limite_gasto_diario: '', regla2_limite_operaciones_hora: '' });
    } else {
      // SI FALLA PORQUE YA TIENE SESIÓN, CAMBIAMOS EL ESTADO AUTOMÁTICAMENTE
      if (JSON.stringify(resultado).includes("Ya tienes una sesión activa")) {
          alert("⚠️ Ya tienes una sesión activa. Te mostramos el panel para finalizarla.");
          setSesionActivaJugador(true); 
      } else {
          let mensajeError = "❌ No se pudo iniciar:\n";
          if (resultado && typeof resultado === 'object') {
             Object.keys(resultado).forEach(k => mensajeError += `• ${resultado[k]}\n`);
          }
          alert(mensajeError);
      }
    }
  };

  // --- ACCIÓN: FINALIZAR SESIÓN ---
  const handleJugadorFinalizar = async (e) => {
      e.preventDefault();
      
      // Solo enviamos el DNI, el backend calcula el dinero
      const datosEnvio = { 
          dni_jugador: usuarioObj?.dni 
      };

      const resultado = await postData(ENDPOINT_FINALIZAR, datosEnvio);
      
      if (resultado && !resultado.error) {
          // Mostramos el resumen que nos devuelve el backend
          alert(`🏁 Sesión Finalizada.\n\n${resultado.balance_juego}\n💰 Saldo Final: ${resultado.saldo_final}€`);
          
          setSesionActivaJugador(null); 
      } else {
          alert("❌ Error al finalizar: " + (resultado.error || JSON.stringify(resultado)));
      }
  };

  // --- ACCIÓN ADMIN ---
  const handleGuardarSeguridad = async () => {
      if (!sesionSeleccionada) return;
      const url = `${ENDPOINT_SEGURIDAD}${sesionSeleccionada.id}/`;
      const resultado = await putData(url, formSeguridad);
      if (resultado && !resultado.error) {
          alert("✅ Límites actualizados");
          setEditandoSeguridad(false);
          cargarDetalleSesion(sesionSeleccionada.id);
      } else {
          alert("❌ Error actualizando");
      }
  };

  const handleChangeInicio = (e) => setFormJugadorInicio({ ...formJugadorInicio, [e.target.name]: e.target.value });
  const handleChangeSeguridad = (e) => setFormSeguridad({ ...formSeguridad, [e.target.name]: e.target.value });
  
  const calcularBalance = (inicial, final) => {
      if (final === null || final === undefined) return "En curso";
      return (parseFloat(final) - parseFloat(inicial)).toFixed(2) + " €";
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ================= VISTA JUGADOR ================= */}
      {rol !== 'admin' && (
          <div style={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
              
              {/* CASO 1: TIENE SESIÓN ACTIVA (Muestra tarjeta ROJA de Finalizar) */}
              {sesionActivaJugador ? (
                  <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#330000', border: '1px solid #ff4444', color: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 0 20px rgba(255,68,68,0.2)'}}>
                      <h2 style={{marginTop:0, color: '#ff4444', textAlign: 'center'}}>🛑 Finalizar Juego</h2>
                      <p style={{textAlign:'center', color:'#ccc', marginBottom:'30px'}}>
                          ¿Has terminado por hoy? <br/>
                          El sistema calculará tu saldo final automáticamente.
                      </p>
                      
                      <form onSubmit={handleJugadorFinalizar} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                          
                          {/* YA NO HAY INPUT DE DINERO AQUÍ */}
                          
                          <button className="btn" type="submit" style={{marginTop:'10px', height:'50px', backgroundColor:'#ff4444', color:'white', fontSize:'1.2em', fontWeight:'bold', border:'none', cursor:'pointer', borderRadius:'8px'}}>
                            CERRAR SESIÓN Y RETIRAR
                          </button>
                      </form>

                      <div style={{marginTop:'20px', textAlign:'center'}}>
                          <small style={{color:'#666', cursor:'pointer', textDecoration:'underline'}} onClick={() => setSesionActivaJugador(null)}>
                              (¿Error visual? Volver a Iniciar)
                          </small>
                      </div>
                  </div>
              ) : (
                  
              /* CASO 2: NO TIENE SESIÓN (Muestra tarjeta VERDE de Iniciar) */
                  <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#002200', border: '1px solid #00ff88', color: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 0 20px rgba(0,255,136,0.1)'}}>
                    <h2 style={{marginTop:0, color: '#00ff88', textAlign: 'center'}}>🎰 Nueva Sesión</h2>
                    <p style={{textAlign:'center', color:'#ccc', marginBottom:'30px'}}>Configura tus límites antes de empezar.</p>
                    
                    <form onSubmit={handleJugadorIniciar} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                      <div>
                        <label style={{display:'block', marginBottom:'8px', fontWeight:'bold'}}>💰 Saldo Inicial (€)</label>
                        <input name="saldo_inicio" type="number" placeholder="Ej: 50" value={formJugadorInicio.saldo_inicio} onChange={handleChangeInicio} required style={{width: '100%', padding:'12px', borderRadius:'8px', border:'none', fontSize:'1.1em'}} />
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                          <div><label style={{display:'block', marginBottom:'8px', fontSize:'0.9em', color:'#aaa'}}>Límite Gasto (€)</label><input name="regla1_limite_gasto_diario" type="number" placeholder="Opcional" value={formJugadorInicio.regla1_limite_gasto_diario} onChange={handleChangeInicio} style={{width: '100%', padding:'10px', borderRadius:'8px', border:'none'}} /></div>
                          <div><label style={{display:'block', marginBottom:'8px', fontSize:'0.9em', color:'#aaa'}}>Límite Ops/Hora</label><input name="regla2_limite_operaciones_hora" type="number" placeholder="Opcional" value={formJugadorInicio.regla2_limite_operaciones_hora} onChange={handleChangeInicio} style={{width: '100%', padding:'10px', borderRadius:'8px', border:'none'}} /></div>
                      </div>
                      <button className="btn" type="submit" style={{marginTop:'10px', height:'50px', backgroundColor:'#00ff88', color:'black', fontSize:'1.2em', fontWeight:'bold', border:'none', cursor:'pointer', borderRadius:'8px'}}>
                        🚀 COMENZAR
                      </button>
                    </form>
                    
                    {/* Botón "trampa" por si recargas la página y el frontend olvida que tienes sesión */}
                    <div style={{marginTop:'20px', textAlign:'center'}}>
                        <small style={{color:'#666', cursor:'pointer', textDecoration:'underline'}} onClick={() => setSesionActivaJugador(true)}>
                            ¿Ya tienes una sesión activa? Clic aquí para finalizarla
                        </small>
                    </div>
                  </div>
              )}
          </div>
      )}


      {/* ================= VISTA ADMIN ================= */}
      {rol === 'admin' && (
        <>
            <h2 style={{color: '#d4af37', borderBottom: '2px solid #d4af37', paddingBottom: '10px'}}>👮‍♂️ Monitor de Sesiones (Admin)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div className="card">
                <h3>📜 Todas las sesiones</h3>
                {loadingList ? <p>Cargando...</p> : (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.9em', borderCollapse: 'collapse' }}>
                        <thead><tr style={{textAlign:'left'}}><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                        {listaSesiones.map(sesion => (
                            <tr key={sesion.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{padding:'8px'}}>{sesion.fecha_actual} <br/><small style={{color:'#888'}}>{sesion.hora_inicio}</small></td>
                            <td style={{padding:'8px'}}>{sesion.activa ? <span style={{color:'green', fontWeight:'bold'}}>ACTIVA</span> : <span style={{color:'gray'}}>CERRADA</span>}</td>
                            <td style={{padding:'8px'}}><button onClick={() => cargarDetalleSesion(sesion.id)} style={{cursor:'pointer', background:'#eee', border:'1px solid #ccc', borderRadius:'3px', padding:'2px 8px'}}>Ver</button></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>
                {/* DETALLE Y EDICIÓN DE SEGURIDAD (ADMIN) */}
                <div className="card" style={{backgroundColor: '#2a2a2a', color: 'white'}}>
                {sesionSeleccionada ? (
                    <>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #444', marginBottom:'15px', paddingBottom:'10px'}}>
                        <h3 style={{margin:0}}>🔎 Sesión #{sesionSeleccionada.id}</h3>
                        <span style={{fontSize:'0.9em', color: sesionSeleccionada.activa ? '#4ade80' : '#aaa'}}>
                        {sesionSeleccionada.activa ? '🟢 EN CURSO' : '🔴 FINALIZADA'}
                        </span>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                        <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}><small style={{color:'#888'}}>Saldo Inicial</small><div style={{fontSize:'1.4em', fontWeight:'bold'}}>{sesionSeleccionada.saldo_inicio} €</div></div>
                        <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}><small style={{color:'#888'}}>Saldo Final</small><div style={{fontSize:'1.4em', fontWeight:'bold'}}>{sesionSeleccionada.saldo_final !== null ? sesionSeleccionada.saldo_final + ' €' : '---'}</div></div>
                        <div style={{background:'#333', padding:'15px', borderRadius:'8px', textAlign:'center'}}><small style={{color:'#888'}}>Balance</small><div style={{fontSize:'1.4em', fontWeight:'bold', color:'#d4af37'}}>{calcularBalance(sesionSeleccionada.saldo_inicio, sesionSeleccionada.saldo_final)}</div></div>
                    </div>
                    <div style={{background: '#222', padding:'15px', borderRadius:'8px', border: '1px solid #444', marginBottom:'20px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                            <h4 style={{margin:0, color:'#d4af37'}}>🛡️ Límites de Seguridad</h4>
                            {sesionSeleccionada.activa && !editandoSeguridad && (<button onClick={() => setEditandoSeguridad(true)} style={{cursor:'pointer', background:'transparent', border:'1px solid #666', color:'white', borderRadius:'4px', padding:'2px 8px', fontSize:'0.8em'}}>✏️ Editar</button>)}
                        </div>
                        {editandoSeguridad ? (
                            <div style={{display:'flex', gap:'10px', alignItems:'flex-end'}}>
                                <div><label style={{fontSize:'0.8em', color:'#ccc'}}>Gasto Max (€)</label><input name="regla1_limite_gasto_diario" type="number" value={formSeguridad.regla1_limite_gasto_diario} onChange={handleChangeSeguridad} style={{width:'80px', padding:'5px'}} /></div>
                                <div><label style={{fontSize:'0.8em', color:'#ccc'}}>Ops/Hora</label><input name="regla2_limite_operaciones_hora" type="number" value={formSeguridad.regla2_limite_operaciones_hora} onChange={handleChangeSeguridad} style={{width:'80px', padding:'5px'}} /></div>
                                <button onClick={handleGuardarSeguridad} style={{background:'#28a745', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Guardar</button>
                                <button onClick={() => setEditandoSeguridad(false)} style={{background:'#dc3545', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer'}}>Cancelar</button>
                            </div>
                        ) : (
                            <div style={{display:'flex', gap:'30px'}}>
                                <div><span style={{color:'#888', fontSize:'0.9em'}}>Gasto Max: </span><strong>{sesionSeleccionada.regla1_limite_gasto_diario} €</strong></div>
                                <div><span style={{color:'#888', fontSize:'0.9em'}}>Ops/Hora: </span><strong>{sesionSeleccionada.regla2_limite_operaciones_hora}</strong></div>
                            </div>
                        )}
                    </div>
                    <h4>🎲 Historial de Juegos</h4>
                    {sesionSeleccionada.juegos_jugados && sesionSeleccionada.juegos_jugados.length > 0 ? (
                        <table style={{width:'100%', fontSize:'0.9em'}}>
                        <thead style={{color:'#ccc'}}><tr><th style={{textAlign:'left'}}>Juego</th><th>Hora</th><th style={{textAlign:'right'}}>Apostado</th><th style={{textAlign:'right'}}>Ganado</th></tr></thead>
                        <tbody>{sesionSeleccionada.juegos_jugados.map((juego, idx) => (<tr key={idx} style={{borderBottom:'1px solid #444'}}><td style={{padding:'8px 0'}}>{juego.juego_nombre}</td><td>{new Date(juego.fecha).toLocaleTimeString()}</td><td style={{textAlign:'right', color:'#ff6b6b'}}>-{juego.cantidad_apostada} €</td><td style={{textAlign:'right', color:'#51cf66'}}>+{juego.ganancia} €</td></tr>))}</tbody>
                        </table>
                    ) : <p style={{fontStyle:'italic', color:'#666', textAlign:'center'}}>No hay jugadas registradas.</p>}
                    </>
                ) : <div style={{textAlign:'center', padding:'50px', color:'#666'}}><p>👈 Selecciona una sesión...</p></div>}
                </div>
            </div>
        </>
      )}

    </div>
  );
}

export default Sesiones;