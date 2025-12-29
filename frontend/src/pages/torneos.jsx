import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [form, setForm] = useState({ nombre: '', precio_inscripcion: '', aforo_maximo: 100, fecha_inicio: '' });

  // Cargar torneos al iniciar
  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    // NOTA: Esto fallará hasta que Django tenga la URL '/eventos/torneos/' configurada
    const data = await getData('eventos/torneos/'); 
    if (Array.isArray(data)) setTorneos(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await postData('eventos/crear_torneo/', form); // URL a configurar en Django
    alert('Torneo enviado');
    cargarTorneos();
  };

  return (
    <div>
      <h2 style={{color: '#d4af37'}}>🏆 Gestión de Torneos</h2>
      
      {/* Formulario de Creación */}
      <div className="card">
        <h3>Nuevo Torneo</h3>
        <form onSubmit={handleSubmit} style={{display:'grid', gap:'10px', gridTemplateColumns:'1fr 1fr'}}>
          <input placeholder="Nombre del Torneo" onChange={e => setForm({...form, nombre: e.target.value})} />
          <input type="number" placeholder="Precio (€)" onChange={e => setForm({...form, precio_inscripcion: e.target.value})} />
          <input type="date" onChange={e => setForm({...form, fecha_inicio: e.target.value})} />
          <button className="btn" type="submit">Crear Torneo</button>
        </form>
      </div>

      {/* Tabla de Listado */}
      <div className="card">
        <h3>Torneos Activos</h3>
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
                <td>{t.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {torneos.length === 0 && <p style={{textAlign:'center', opacity:0.5}}>No hay torneos o no hay conexión con Oracle</p>}
      </div>
    </div>
  );
}

export default Torneos;