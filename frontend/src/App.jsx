import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Torneos from './pages/torneos'; 

// Componentes "Dummy" para que no de error mientras creáis los demás
const Inicio = () => <div className="card"><h1>🎰 Bienvenido al Casino Lasaña</h1><p>Selecciona un módulo en el menú lateral.</p></div>;
const Usuarios = () => <div className="card"><h2>👤 Gestión de Usuarios</h2><p>Aquí iría el componente de David.</p></div>;
const Juegos = () => <div className="card"><h2>🎲 Catálogo de Juegos</h2><p>Aquí iría el componente de Minerva.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* BARRA LATERAL */}
        <div className="sidebar">
          <h1>♠️ Lasaña<br/>Casino</h1>
          <nav>
            <NavLink to="/">🏠 Inicio</NavLink>
            <NavLink to="/usuarios">👤 Usuarios</NavLink>
            <NavLink to="/juegos">🎲 Juegos</NavLink>
            <NavLink to="/movimientos">💸 Movimientos</NavLink>
            <NavLink to="/eventos">🏆 Torneos</NavLink>
            <NavLink to="/sesiones">⏱️ Sesiones</NavLink>
          </nav>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/juegos" element={<Juegos />} />
            <Route path="/eventos" element={<Torneos />} /> {/* Aquí carga TU página */}
            {/* Añadir el resto de rutas conforme existan */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

// Pequeño componente para detectar link activo
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>{children}</Link>;
}

export default App;