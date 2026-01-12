import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../services/api'; 

function Login({ setUsuario }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ dni: '', contrasena: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Llamamos a tu Backend Django
    const response = await postData('usuarios/login/', form);

    if (response && response.exito) {
      // 2. Preparamos el objeto usuario
      const usuarioLogueado = {
        rol: response.rol,     // 'admin' o 'jugador'
        ...response.usuario    // dni, nombre, etc.
      };

      // 3. Guardamos en navegador (para no perderlo al refrescar)
      localStorage.setItem('casino_usuario', JSON.stringify(usuarioLogueado));
      
      // 4. Actualizamos el estado de la App
      setUsuario(usuarioLogueado);

      // 5. REDIRECCIÓN INTELIGENTE
      if (response.rol === 'admin') {
        navigate('/dashboard'); // O '/usuarios'
      } else {
        navigate('/mis-torneos'); // Pantalla principal del jugador
      }

    } else {
      setError('❌ DNI o contraseña incorrectos');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      height: '100vh', 
      width: '100vw', /* <--- ¡ESTA ES LA LÍNEA MÁGICA QUE TE FALTA! */
      display: 'flex', 
      justifyContent: 'center', /* Centrado horizontal */
      alignItems: 'center',     /* Centrado vertical */
      background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
      color: 'white',
      position: 'absolute', /* Asegura que se ponga encima de todo */
      top: 0,
      left: 0
    }}>
      <div className="card" style={{width: '350px', padding: '40px', textAlign: 'center'}}>
        <h1 style={{color: '#d4af37', marginBottom:'30px'}}>🔐 ACCESO CASINO</h1>
        
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input 
            name="dni" 
            placeholder="DNI Usuario" 
            value={form.dni} onChange={handleChange} 
            required 
            style={{padding: '12px', background:'#222', border:'1px solid #444', color:'white', borderRadius:'6px'}}
          />
          <input 
            type="password" 
            name="contrasena" 
            placeholder="Contraseña" 
            value={form.contrasena} onChange={handleChange} 
            required 
            style={{padding: '12px', background:'#222', border:'1px solid #444', color:'white', borderRadius:'6px'}}
          />
          
          <button type="submit" className="btn" style={{marginTop:'10px'}}>
            INICIAR SESIÓN
          </button>
        </form>

        {error && <p style={{color: '#ff4444', marginTop: '15px', fontWeight:'bold'}}>{error}</p>}

        <div style={{marginTop: '30px', fontSize: '0.8rem', color: '#666', textAlign:'left'}}>
            <p><strong>Admin Test:</strong> 88888888A / admin123</p>
            <p><strong>Jugador Test:</strong> 12345678X / 1234</p>
        </div>
      </div>
    </div>
  );
}

export default Login;