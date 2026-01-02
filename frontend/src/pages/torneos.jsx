import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [form, setForm] = useState({
    nombre: '',
    juego: 1, // <--- Aqui tiene que ir un ID de juego que ya exista en la BD
    fecha_inicio: '',
    hora_inicio: '10:00',
    aforo_maximo: 100,
    precio_inscripcion: 0,
    reglas: 'Reglas estándar',
    premio: '1000€',
    estado: 'programado'
  });

  // 1. Cargar datos al entrar en la página
  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    // LLAMADA REAL A LA API DJANGO
    // La URL base ya está en api.js, aquí solo ponemos la ruta específica
    const data = await getData('eventos/torneos/'); 
    
    if (Array.isArray(data)) {
      setTorneos(data);
    } else {
      console.error("Error al cargar torneos:", data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ENVIAR DATOS A ORACLE
    const resultado = await postData('eventos/torneos/', form);
    
    if (resultado && !resultado.error) {
      alert('✅ Torneo creado con éxito en Oracle');
      cargarTorneos(); // Recargar la lista para ver el nuevo
    } else {
      alert('❌ Error al crear. Revisa que el ID del Juego exista.');
      console.log(resultado);
    }
  };

  // Función para actualizar el formulario mientras se escribe
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2 style={{color: '#d4af37'}}>🏆 Gestión de Torneos (Conectado a Oracle)</h2>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="card">
        <h3>Nuevo Torneo</h3>
        <form onSubmit={handleSubmit} style={{display:'grid', gap:'10px', gridTemplateColumns:'1fr 1fr'}}>
          
          <input name="nombre" placeholder="Nombre del Torneo" onChange={handleChange} required />
          
          <div>
            <label style={{fontSize:'0.8rem', color:'#888'}}>ID Juego (Debe existir en BD)</label>
            <input name="juego" type="number" placeholder="ID Juego" value={form.juego} onChange={handleChange} required />
          </div>

          <input name="fecha_inicio" type="date" onChange={handleChange} required />
          <input name="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange} required />
          
          <input name="precio_inscripcion" type="number" placeholder="Precio (€)" onChange={handleChange} required />
          <input name="aforo_maximo" type="number" placeholder="Aforo Max" value={form.aforo_maximo} onChange={handleChange} />
          
          <input name="premio" placeholder="Premio (ej: 500€)" value={form.premio} onChange={handleChange} />
          
          <button className="btn" type="submit" style={{gridColumn:'span 2'}}>Guardar en Base de Datos</button>
        </form>
      </div>

      {/* LISTADO DE DATOS */}
      <div className="card">
        <h3>Listado de Torneos</h3>
        {loading ? <p>Cargando datos de la UGR...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Precio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {torneos.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.nombre}</td>
                  <td>{t.fecha_inicio}</td>
                  <td>{t.precio_inscripcion}€</td>
                  <td>
                    <span style={{
                      color: t.estado === 'programado' ? '#00ff88' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {t.estado.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && torneos.length === 0 && (
          <p style={{textAlign:'center', opacity:0.5}}>No hay torneos registrados todavía.</p>
        )}
      </div>
    </div>
  );
}

export default Torneos;