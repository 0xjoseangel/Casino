import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function Sesiones() { // <--- CAMBIAD EL NOMBRE (ej: Usuarios, Juegos...)
  
  // 1. CONFIGURACIÓN: Poned aquí la URL de vuestra API (mirad backend/urls.py)
  // Ejemplos: 'usuarios/jugadores/', 'juegos/juegos/', 'movimientos/transacciones/'
  const ENDPOINT = 'api/sesiones'; 

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. FORMULARIO: Poned aquí los campos de vuestro models.py
  const [form, setForm] = useState({
    campo1: '', // Ej: nombre
    campo2: '', // Ej: dni
    campo3: '', // Ej: saldo
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const data = await getData(ENDPOINT); 
    if (Array.isArray(data)) {
      setDatos(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await postData(ENDPOINT, form);
    if (resultado && !resultado.error) {
      alert('✅ Guardado en Oracle correctamente');
      cargarDatos(); // Recargar lista
    } else {
      alert('❌ Error al guardar. Revisad la consola o los datos.');
      console.log(resultado);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 style={{color: '#d4af37'}}>Gestión de [PONER NOMBRE]</h2>

      {/* --- FORMULARIO --- */}
      <div className="card">
        <h3>Nuevo Registro</h3>
        <form onSubmit={handleSubmit} style={{display:'grid', gap:'10px', gridTemplateColumns:'1fr 1fr'}}>
          
          {/* 3. INPUTS: Cread un input por cada campo de vuestro formulario */}
          {/* IMPORTANTE: el 'name' debe coincidir con el estado 'form' de arriba */}
          
          <input name="campo1" placeholder="Ej: Nombre" onChange={handleChange} required />
          <input name="campo2" placeholder="Ej: DNI" onChange={handleChange} required />
          {/* <input name="campo3" type="number" ... /> */}

          <button className="btn" type="submit" style={{gridColumn:'span 2'}}>Guardar</button>
        </form>
      </div>

      {/* --- TABLA --- */}
      <div className="card">
        <h3>Listado Actual</h3>
        {loading ? <p>Cargando...</p> : (
          <table>
            <thead>
              <tr>
                {/* 4. CABECERAS: Poned los títulos de vuestras columnas */}
                <th>ID</th>
                <th>Columna 1</th>
                <th>Columna 2</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(item => (
                <tr key={item.id || item.dni}> {/* Usad ID o DNI como key */}
                  <td>{item.id || item.dni}</td>
                  
                  {/* 5. CELDAS: Poned las variables de vuestro modelo */}
                  <td>{item.campo1}</td>
                  <td>{item.campo2}</td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PlantillaGestion;