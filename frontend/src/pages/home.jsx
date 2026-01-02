import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [rol, setRol] = useState(null);

  useEffect(() => {
    // Leemos quién somos (Admin o Jugador)
    const storedRol = localStorage.getItem('casino_rol');
    setRol(storedRol);
  }, []);

  return (
    <div className="home-container">
      {/* 1. HERO SECTION: Bienvenida Dinámica */}
      <div className="hero-banner" style={{
        borderLeft: `5px solid ${rol === 'admin' ? '#d4af37' : '#00ff88'}`
      }}>
        <div>
          <h1>👋 Hola, {rol === 'admin' ? 'Administrador' : 'Jugador'}</h1>
          <p>
            {rol === 'admin' 
              ? 'Panel de Control del Sistema - Lasaña Casino' 
              : 'Bienvenido a la mejor experiencia de juego online.'}
          </p>
        </div>
        <div className="status-badge">
          🟢 Sistema Online
        </div>
      </div>

      {/* 2. CONTENIDO DIFERENTE SEGÚN EL ROL */}
      
      {/* --- VISTA DE ADMINISTRADOR --- */}
      {rol === 'admin' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>👥 Usuarios Totales</h3>
              <p className="stat-number">1,245</p>
            </div>
            <div className="stat-card">
              <h3>💰 Caja del Casino</h3>
              <p className="stat-number" style={{color: '#d4af37'}}>€ 45,200</p>
            </div>
            <div className="stat-card">
              <h3>🏆 Torneos Activos</h3>
              <p className="stat-number">8</p>
            </div>
          </div>

          <h2 className="section-title">Accesos Rápidos de Gestión</h2>
          <div className="modules-grid">
             <Link to="/usuarios" className="module-card">
                <div className="icon">👤</div>
                <h3>Usuarios</h3>
             </Link>
             <Link to="/eventos" className="module-card highlight">
                <div className="icon">🏆</div>
                <h3>Torneos</h3>
             </Link>
             <Link to="/juegos" className="module-card">
                <div className="icon">🎰</div>
                <h3>Juegos</h3>
             </Link>
          </div>
        </>
      )}

      {/* --- VISTA DE JUGADOR --- */}
      {rol === 'jugador' && (
        <>
          <div className="stats-grid">
             <div className="stat-card">
              <h3>👛 Mi Saldo</h3>
              <p className="stat-number" style={{color: '#00ff88'}}>€ 150.00</p>
            </div>
            <div className="stat-card">
              <h3>🎲 Mis Apuestas</h3>
              <p className="stat-number">3 Activas</p>
            </div>
          </div>

          <h2 className="section-title">¿A qué quieres jugar hoy?</h2>
          <div className="modules-grid">
             <Link to="/mis-torneos" className="module-card highlight" style={{borderColor: '#00ff88'}}>
                <div className="icon">🏆</div>
                <h3 style={{color: '#00ff88'}}>Torneos</h3>
                <p>Apúntate y compite</p>
             </Link>
             
             {/* Enlaces placeholder hasta que tus compañeros los hagan */}
             <div className="module-card" style={{opacity: 0.7}}>
                <div className="icon">🎰</div>
                <h3>Tragaperras</h3>
                <p>Próximamente</p>
             </div>
             <div className="module-card" style={{opacity: 0.7}}>
                <div className="icon">🃏</div>
                <h3>Blackjack</h3>
                <p>Próximamente</p>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;