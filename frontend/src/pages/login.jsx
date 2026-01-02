import { useNavigate } from 'react-router-dom';

function Login({ setRol }) {
  const navigate = useNavigate();

  const entrarComo = (rol) => {
    setRol(rol); // Guardamos en la App quién somos
    // Guardamos en navegador para no perderlo al recargar (opcional pero útil)
    localStorage.setItem('casino_rol', rol);
    navigate('/dashboard');
  };

  return (
    <div style={{
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
      color: 'white'
    }}>
      <div className="card" style={{textAlign: 'center', padding: '50px'}}>
        <h1 style={{color: '#d4af37', marginBottom: '40px'}}>🎰 Lasaña Casino</h1>
        <p>Selecciona tu perfil para acceder:</p>
        
        <div style={{display: 'flex', gap: '20px', marginTop: '30px'}}>
          {/* BOTÓN ADMIN */}
          <button 
            onClick={() => entrarComo('admin')}
            style={{
              padding: '20px 40px', 
              background: '#d4af37', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              borderRadius: '8px'
            }}>
            Soy ADMINISTRADOR 🛡️
          </button>

          {/* BOTÓN JUGADOR */}
          <button 
            onClick={() => entrarComo('jugador')}
            style={{
              padding: '20px 40px', 
              background: '#00ff88', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              borderRadius: '8px'
            }}>
            Soy JUGADOR 🎲
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;