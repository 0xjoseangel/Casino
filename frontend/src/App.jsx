import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// TUS PÁGINAS
import Login from './pages/login';
import TorneosAdmin from './pages/torneos'; // Tu página actual (Gestión)
import TorneosJugador from './pages/torneosJugador'; // <--- NUEVA (Vista cliente)
import Home from './pages/home';

function App() {
  const [rol, setRol] = useState(localStorage.getItem('casino_rol') || null);

  // Si no hay rol, mostramos Login. Si hay rol, mostramos la App.
  if (!rol) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login setRol={setRol} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* --- BARRA LATERAL (Cambia según el rol) --- */}
        <div className="sidebar" style={{borderColor: rol === 'admin' ? '#d4af37' : '#00ff88'}}>
          <h1 style={{color: rol === 'admin' ? '#d4af37' : '#00ff88'}}>
            {rol === 'admin' ? 'PANEL ADMIN' : 'ZONA JUGADOR'}
          </h1>
          
          <nav>
            {/* ENLACES COMUNES */}
            <Link to="/dashboard" className="nav-link">🏠 Inicio</Link>

            {/* MENÚ DE ADMINISTRADOR */}
            {rol === 'admin' && (
              <>
                <div style={{opacity:0.5, marginTop:10, fontSize:12}}>GESTIÓN</div>
                <Link to="/usuarios" className="nav-link">👤 Usuarios</Link>
                <Link to="/eventos" className="nav-link">🏆 Torneos (Edit)</Link>
                <Link to="/juegos" className="nav-link">🎰 Juegos</Link>
                <Link to="/movimientos" className="nav-link">💸 Finanzas</Link>
              </>
            )}

            {/* MENÚ DE JUGADOR */}
            {rol === 'jugador' && (
              <>
                 <div style={{opacity:0.5, marginTop:10, fontSize:12}}>DIVERSIÓN</div>
                 <Link to="/mis-torneos" className="nav-link">🏆 Torneos Disp.</Link>
                 <Link to="/catalogo" className="nav-link">🎰 Jugar</Link>
                 <Link to="/perfil" className="nav-link">👤 Mi Perfil</Link>
              </>
            )}

            <button 
              onClick={() => { setRol(null); localStorage.removeItem('casino_rol'); }}
              style={{marginTop: 'auto', background: 'transparent', border:'1px solid #555', color:'white', width:'100%', padding:10, cursor:'pointer'}}
            >
              Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* --- CONTENIDO --- */}
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Home />} />
            
            {/* RUTAS DE ADMIN */}
            {rol === 'admin' && (
              <>
                <Route path="/eventos" element={<TorneosAdmin />} />
                {/* Aquí irían las rutas de tus compañeros (modo admin) */}
              </>
            )}

            {/* RUTAS DE JUGADOR */}
            {rol === 'jugador' && (
              <>
                <Route path="/mis-torneos" element={<TorneosJugador />} />
                {/* Aquí irían las rutas de jugar */}
              </>
            )}

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;