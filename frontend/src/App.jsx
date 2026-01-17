import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import './App.css';

// Páginas importadas
// Páginas importadas
import AdminUsuarios from './pages/adminUsuarios';
import Login from './pages/login';
import CrearJugador from './pages/crearJugador';
import MiPerfil from './pages/miPerfil';
import TorneosAdmin from './pages/torneos';
import TorneosJugador from './pages/torneosJugador';
import Home from './pages/home';
import Sesiones from './pages/Sesiones';
import ListaTransacciones from './pages/listaTransacciones';
import Apuestas from './pages/apuestas';
import PromocionesAdmin from './pages/promocionesAdmin';
import PromocionesJugador from './pages/promocionesJugador';
import TransaccionesJugador from './pages/transaccionesJugador';
import JuegosAdmin from './pages/juegosAdmin'; 
import JuegosJugador from './pages/juegosJugador';

// Componente NavLink con estado activo
function NavItem({ to, icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      {children}
    </Link>
  );
}

function AppContent({ usuario, logout }) {
  const esAdmin = usuario.rol === 'admin';

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className={`sidebar ${!esAdmin ? 'player-theme' : ''}`}>
        <div className="sidebar-header">
          <h1 className={esAdmin ? 'admin-title' : 'player-title'}>
            {esAdmin ? 'PANEL ADMIN' : 'ZONA JUEGO'}
          </h1>
        </div>

        <nav>
          <NavItem to="/dashboard" icon="🏠">Inicio</NavItem>

          {/* MENÚ DE ADMINISTRADOR */}
          {esAdmin && (
            <>
              <div className="nav-section-label">Gestión</div>
              <NavItem to="/usuarios" icon="👤">Usuarios</NavItem>
              <NavItem to="/torneos-gestion" icon="🏆">Torneos</NavItem>
              <NavItem to="/juegos-gestion" icon="🎰">Juegos</NavItem>
              <NavItem to="/sesiones-global" icon="⏱️">Sesiones</NavItem>
              <NavItem to="/finanzas" icon="💰">Transacciones</NavItem>
              <NavItem to="/promociones-gestion" icon="🎁">Promociones</NavItem>
            </>
          )}

          {/* MENÚ DE JUGADOR */}
          {!esAdmin && (
            <>
              <div className="nav-section-label">Jugar</div>
              <NavItem to="/mis-torneos" icon="🏆">Torneos</NavItem>
              <NavItem to="/mis-apuestas" icon="🎲">Mis Apuestas</NavItem>
              <NavItem to="/transacciones" icon="💳">Transacciones</NavItem>
              <NavItem to="/juegos" icon="🎰">Sala de Juegos</NavItem>
              <NavItem to="/sesiones-global" icon="⏱️">Sesiones</NavItem>
              <NavItem to="/mi-perfil" icon="👤">Mi Perfil</NavItem>
              <NavItem to="/promociones" icon="🎁">Ofertas</NavItem>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-info-label">Conectado como</div>
            <div className="user-info-name">{usuario.nombre}</div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-full btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="content">
        <Routes>
          <Route path="/dashboard" element={<Home usuario={usuario} />} />

          {/* Rutas de Admin */}
          {esAdmin && (
            <>
              <Route path="/torneos-gestion" element={<TorneosAdmin />} />
              <Route path="/sesiones-global" element={<Sesiones />} />
              <Route path="/finanzas" element={<ListaTransacciones />} />
              <Route path="/promociones-gestion" element={<PromocionesAdmin />} />
              <Route path="/usuarios" element={<AdminUsuarios />} />
              <Route path="/juegos-gestion" element={<JuegosAdmin />} />
            </>
          )}

          {/* Rutas de Jugador */}
          {!esAdmin && (
            <>
              <Route path="/mis-torneos" element={<TorneosJugador usuario={usuario} />} />
              <Route path="/sesiones-global" element={<Sesiones />} />
              <Route path="/mis-apuestas" element={<Apuestas />} />
              <Route path="/transacciones" element={<TransaccionesJugador />} />
              <Route path="/promociones" element={<PromocionesJugador />} />
              <Route path="/juegos" element={<JuegosJugador />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
            </>
          )}

          <Route path="/registro" element={<CrearJugador />} />
          <Route path="*" element={<Navigate to={esAdmin ? "/dashboard" : "/mis-torneos"} />} />
        </Routes>
      </main>
    </div>
  );
}

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
          <Route path="/registro" element={<CrearJugador />} />
          <Route path="*" element={<Login setUsuario={setUsuario} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <AppContent usuario={usuario} logout={logout} />
    </BrowserRouter>
  );
}

export default App;
