import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Sesiones() { 
  
  // --- CONFIGURACIÓN DE ENDPOINTS ---
  const ENDPOINT_LISTADO = 'sesiones/listado/';
  const ENDPOINT_INICIAR = 'sesiones/iniciar/';
  const ENDPOINT_DETALLE = 'sesiones/historial/'; // Se le añade ID al final (ej: historial/15/)

  // --- ESTADOS ---
  const [listaSesiones, setListaSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  
  // Estado para el formulario de inicio
  const [form, setForm] = useState({
    saldo_inicio: '', 
    regla1_limite_gasto_diario: '',
    regla2_limite_operaciones_hora: '',
  });

  // Cargar lista al montar
  useEffect(() => {
    cargarListaSesiones();
  }, []);

  // --- FUNCIONES DE CARGA ---

  const cargarListaSesiones = async () => {
    const data = await getData(ENDPOINT_LISTADO);
    if (Array.isArray(data)) {
      setListaSesiones(data);
      // Opcional: Seleccionar automáticamente la primera (la más reciente)
      if (data.length > 0 && !sesionSeleccionada) {
        cargarDetalleSesion(data[0].id);
      }
    }
    setLoadingList(false);
  };

  const cargarDetalleSesion = async (id) => {
    // Aquí llamamos al endpoint que hicimos con el modelo de Julián (RF5.4)
    // Nos devuelve balance + lista de juegos
    const data = await getData(`${ENDPOINT_DETALLE}${id}/`);
    if (data && !data.error) {
      setSesionSeleccionada(data);
    }
  };

  // --- FUNCIONES DEL FORMULARIO ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData(ENDPOINT_INICIAR, form);
    
    if (resultado && !resultado.error) {
      alert('✅ Sesión iniciada correctamente');
      // Recargamos la lista para que salga la nueva sesión arriba
      cargarListaSesiones();
      // Limpiamos form
      setForm({ saldo_inicio: '', regla1_limite_gasto_diario: '', regla2_limite_operaciones_hora: '' });
    } else {
      alert('❌ Error al iniciar. Revisa los datos.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- RENDERIZADO ---

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{color: '#d4af37', borderBottom: '2px solid #d4af37', paddingBottom: '10px'}}>
        Gestión de Sesiones y Juego Responsable
      </h2>

      {/* SECCIÓN 1: FORMULARIO DE INICIO (Siempre visible arriba) */}
      <div className="card" style={{ marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{marginTop:0}}>▶ Iniciar Nueva Sesión</h3>
        <form onSubmit={handleSubmit} style={{display:'flex', gap:'15px', alignItems:'flex-end'}}>
          <div>
            <label style={{fontSize:'0.8em', display:'block'}}>Saldo Inicial (€)</label>
            <input name="saldo_inicio" type="number" value={form.saldo_inicio} onChange={handleChange} required style={{padding:'5px'}} />
          </div>
          <div>
            <label style={{fontSize:'0.8em', display:'block'}}>Límite Gasto (€)</label>
            <input name="regla1_limite_gasto_diario" type="number" value={form.regla1_limite_gasto_diario} onChange={handleChange} required style={{padding:'5px'}} />
          </div>
          <div>
            <label style={{fontSize:'0.8em', display:'block'}}>Límite Ops/Hora</label>
            <input name="regla2_limite_operaciones_hora" type="number" value={form.regla2_limite_operaciones_hora} onChange={handleChange} required style={{padding:'5px'}} />
          </div>
          <button className="btn" type="submit" style={{height:'35px'}}>COMENZAR</button>
        </form>
      </div>

      {/* SECCIÓN 2: GRID DOBLE COLUMNA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* COLUMNA IZQUIERDA: LISTADO HISTÓRICO */}
        <div className="card">
          <h3>📜 Historial de Sesiones</h3>
          {loadingList ? <p>Cargando...</p> : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.9em' }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {listaSesiones.map(sesion => (
                    <tr 
                      key={sesion.id} 
                      style={{ 
                        backgroundColor: sesionSeleccionada?.id === sesion.id ? '#e6f7ff' : 'transparent',
                        cursor: 'pointer' 
                      }}
                      onClick={() => cargarDetalleSesion(sesion.id)}
                    >
                      <td>{sesion.fecha_actual}</td>
                      <td>{sesion.hora_inicio}</td>
                      <td>
                        {/* Como BalanceSesionSerializer no tiene campo 'activa' explícito,
                            podemos deducirlo si saldo_final es null */}
                        {sesion.saldo_final === null ? 
                          <span style={{color:'green', fontWeight:'bold'}}>ACTIVA</span> : 
                          <span style={{color:'gray'}}>CERRADA</span>
                        }
                      </td>
                      <td>
                        <button style={{fontSize:'0.8em', padding:'2px 5px'}}>Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: DETALLE SELECCIONADO */}
        <div className="card">
          {sesionSeleccionada ? (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', marginBottom:'10px'}}>
                <h3>🔎 Detalle Sesión #{sesionSeleccionada.id}</h3>
                <span style={{fontSize:'0.9em', color:'#666'}}>
                  {sesionSeleccionada.fecha_actual} | {sesionSeleccionada.hora_inicio} - {sesionSeleccionada.hora_fin || 'En curso'}
                </span>
              </div>

              {/* TARJETAS DE BALANCE */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                <div style={{background:'#eee', padding:'10px', borderRadius:'5px', textAlign:'center'}}>
                  <small>Saldo Inicial</small>
                  <div style={{fontWeight:'bold', fontSize:'1.2em'}}>{sesionSeleccionada.saldo_inicio} €</div>
                </div>
                <div style={{background:'#eee', padding:'10px', borderRadius:'5px', textAlign:'center'}}>
                  <small>Saldo Final</small>
                  <div style={{fontWeight:'bold', fontSize:'1.2em'}}>
                    {sesionSeleccionada.saldo_final !== null ? sesionSeleccionada.saldo_final + ' €' : '---'}
                  </div>
                </div>
                <div style={{background:'#eee', padding:'10px', borderRadius:'5px', textAlign:'center'}}>
                  <small>Balance Neto</small>
                  <div style={{
                    fontWeight:'bold', fontSize:'1.2em',
                    color: (sesionSeleccionada.saldo_final - sesionSeleccionada.saldo_inicio) >= 0 ? 'green' : 'red'
                  }}>
                    {sesionSeleccionada.saldo_final !== null ? 
                      (sesionSeleccionada.saldo_final - sesionSeleccionada.saldo_inicio).toFixed(2) + ' €' : '---'}
                  </div>
                </div>
              </div>

              {/* TABLA DE JUEGOS (RF5.4) */}
              <h4>🎲 Historial de Juegos (Apuestas)</h4>
              {sesionSeleccionada.juegos_jugados && sesionSeleccionada.juegos_jugados.length > 0 ? (
                <table style={{width:'100%'}}>
                  <thead>
                    <tr>
                      <th>Juego</th>
                      <th>Hora</th>
                      <th>Apostado</th>
                      <th>Ganado</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesionSeleccionada.juegos_jugados.map((juego, idx) => (
                      <tr key={idx}>
                        <td>{juego.juego_nombre || 'Juego #' + juego.juego}</td>
                        <td>{new Date(juego.fecha).toLocaleTimeString()}</td>
                        <td style={{color:'red'}}>-{juego.cantidad_apostada} €</td>
                        <td style={{color:'green'}}>+{juego.ganancia} €</td>
                        <td>{juego.resultado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{fontStyle:'italic', color:'#666'}}>No se han registrado jugadas en esta sesión aún.</p>
              )}

            </>
          ) : (
            <div style={{textAlign:'center', padding:'50px', color:'#999'}}>
              <p>👈 Selecciona una sesión de la lista para ver su balance y jugadas.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Sesiones;