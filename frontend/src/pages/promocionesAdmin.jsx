import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api'; // Asegúrate de tener deleteData si lo usas, si no, con postData vale para acciones

function PromocionesAdmin() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Ajusta los campos según tu models.py
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    codigo: '', // Ej: VERANO2026
    descuento: 10,
    fecha_inicio: '',
    fecha_fin: '',
    estado: false // Por defecto inactiva
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
    // Enviamos a la API
    const res = await postData('eventos/promociones/', form);
    if (res && !res.error) {
      alert('✅ Promoción creada');
      cargarDatos();
      // Limpiar form opcional
    } else {
      alert('❌ Error al crear (Revisa fechas o campos)');
    }
  };

  // ACCIONES ESPECIALES (Las que hicimos en views.py)
  const cambiarEstado = async (id, accion) => {
    // accion puede ser 'habilitar' o 'finalizar'
    const res = await postData(`eventos/promociones/${id}/${accion}/`, {});
    if (res) {
        alert(`Promoción ${accion} correctamente`);
        cargarDatos();
    }
  };

  return (
    <div>
      <h2 style={{color: '#d4af37'}}>🎁 Gestión de Promociones</h2>

      {/* FORMULARIO */}
      <div className="card">
        <h3>Nueva Promoción</h3>
        <form onSubmit={handleSubmit} style={{display:'grid', gap:'10px', gridTemplateColumns:'1fr 1fr'}}>
          
          <input name="nombre" placeholder="Nombre Promoción" onChange={handleChange} required />
          <input name="codigo" placeholder="Código (ej: BONO50)" onChange={handleChange} required />
          
          <textarea name="descripcion" placeholder="Descripción..." style={{gridColumn:'span 2', padding:10, background:'#111', color:'white', border:'1px solid #444'}} onChange={handleChange} />
          
          <input name="descuento" type="number" placeholder="% Descuento" onChange={handleChange} />
          <div style={{color:'#888', fontSize:'0.8rem', display:'flex', alignItems:'center'}}>
             Estado inicial: <input type="checkbox" name="estado" onChange={handleChange} style={{width:'auto', marginLeft:10}} /> Activa
          </div>

          <label style={{color:'#888'}}>Inicio: <input name="fecha_inicio" type="date" onChange={handleChange} required /></label>
          <label style={{color:'#888'}}>Fin: <input name="fecha_fin" type="date" onChange={handleChange} required /></label>

          <button className="btn" type="submit" style={{gridColumn:'span 2'}}>Crear Promoción</button>
        </form>
      </div>

      {/* TABLA LISTADO */}
      <div className="card">
        <h3>Listado de Promociones</h3>
        {loading ? <p>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td style={{color: '#d4af37', fontWeight:'bold'}}>{p.codigo}</td>
                  <td>{p.fecha_inicio} / {p.fecha_fin}</td>
                  <td>
                    {p.estado ? (
                        <span style={{color:'#00ff88'}}>ACTIVA</span>
                    ) : (
                        <span style={{color:'red'}}>INACTIVA</span>
                    )}
                  </td>
                  <td>
                    {/* BOTONES MÁGICOS DE LA API */}
                    {!p.estado && (
                        <button onClick={() => cambiarEstado(p.id, 'habilitar')} style={{marginRight:5, cursor:'pointer', background:'green', color:'white', border:'none', padding:5, borderRadius:4}}>
                            Habilitar
                        </button>
                    )}
                    {p.estado && (
                        <button onClick={() => cambiarEstado(p.id, 'finalizar')} style={{cursor:'pointer', background:'orange', color:'black', border:'none', padding:5, borderRadius:4}}>
                            Finalizar
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PromocionesAdmin;