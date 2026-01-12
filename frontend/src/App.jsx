import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

// TUS PÁGINAS IMPORTADAS
import Login from './pages/login';
import TorneosAdmin from './pages/torneos'; 
import TorneosJugador from './pages/torneosJugador'; 
import Home from './pages/home';
import Sesiones from './pages/Sesiones';
import ListaTransacciones from './pages/listaTransacciones';
import Apuestas from './pages/apuestas';
import PromocionesAdmin from './pages/promocionesAdmin';
import PromocionesJugador from './pages/promocionesJugador';

function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('casino_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('casino_usuario');
  };

  if (!usuario) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login setUsuario={setUsuario} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const esAdmin = usuario.rol === 'admin';

  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* --- BARRA LATERAL --- */}
        <div className="sidebar" style={{borderColor: esAdmin ? '#d4af37' : '#00ff88'}}>
          <h1 style={{color: esAdmin ? '#d4af37' : '#00ff88'}}>
            {esAdmin ? 'PANEL ADMIN' : 'ZONA JUEGO'}
          </h1>

          <nav>
            <Link to="/dashboard" className="nav-link">🏠 Inicio</Link>
            
            {/* MENÚ DE ADMINISTRADOR */}
            {esAdmin && (
              <>
                <div style={{fontSize:'0.7rem', color:'#666', marginTop:15, marginBottom:5}}>GESTIÓN</div>
                <Link to="/usuarios" className="nav-link">👤 Usuarios</Link>
                <Link to="/torneos-gestion" className="nav-link">🏆 Torneos (Edit)</Link>
                <Link to="/juegos-gestion" className="nav-link">🎰 Juegos</Link>
                <Link to="/sesiones-global" className="nav-link">⏱️ Sesiones</Link>
                <Link to="/finanzas" className="nav-link">💰 Transacciones</Link>
                <Link to="/promociones-gestion" className="nav-link">🎁 Promociones</Link>
              </>
            )}

            {/* MENÚ DE JUGADOR */}
            {!esAdmin && (
              <>
                <div style={{fontSize:'0.7rem', color:'#666', marginTop:15, marginBottom:5}}>JUGAR</div>
                <Link to="/mis-torneos" className="nav-link">🏆 Torneos</Link>
                <Link to="/mis-apuestas" className="nav-link">🎲 Mis Apuestas</Link> {/* <--- AÑADIDO */}
                <Link to="/casino" className="nav-link">🎰 Sala de Juegos</Link>
                <Link to="/mi-perfil" className="nav-link">👤 Mi Perfil</Link>
                <Link to="/promociones" className="nav-link">🎁 Ofertas</Link>
              </>
            )}
          </nav>

          <div style={{marginTop: 'auto', borderTop:'1px solid #333', paddingTop:10}}>
             <div style={{fontSize:'0.8rem', color:'#888', marginBottom:5}}>Conectado como:</div>
             <div style={{fontWeight:'bold', marginBottom:10}}>{usuario.nombre}</div>
             <button onClick={logout} className="btn" style={{width:'100%', background:'#333', color:'white', fontSize:'0.8rem'}}>
               Cerrar Sesión
             </button>
          </div>
        </div>

        {/* --- RUTAS (Aquí estaba el fallo, faltaban las definiciones) --- */}
        <div className="content">
          <Routes>
            <Route path="/dashboard" element={<Home usuario={usuario} />} />
            
            {/* Rutas de Admin */}
            {esAdmin && (
              <>
                <Route path="/torneos-gestion" element={<TorneosAdmin />} />
                {/* <Route path="/usuarios" element={<UsuariosAdmin />} /> */}
                
                {/* 👇 ESTAS FALTABAN: 👇 */}
                <Route path="/sesiones-global" element={<Sesiones />} />
                <Route path="/finanzas" element={<ListaTransacciones />} />
                <Route path="/promociones-gestion" element={<PromocionesAdmin />} />
              </>
            )}

            {/* Rutas de Jugador */}
            {!esAdmin && (
              <>
                <Route path="/mis-torneos" element={<TorneosJugador />} />
                
                <Route path="/mis-apuestas" element={<Apuestas />} />
                <Route path="/promociones" element={<PromocionesJugador />} />
                
                {/* <Route path="/casino" element={<Casino />} /> */}
              </>
            )}

            <Route path="*" element={<Navigate to={esAdmin ? "/dashboard" : "/mis-torneos"} />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;