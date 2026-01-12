import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getData } from '../services/api';

function Home({ usuario }) {
  const [rol, setRol] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [apuestasCount, setApuestasCount] = useState(0);

  useEffect(() => {
    // Determinar ROL
    if (usuario?.rol) {
      setRol(usuario.rol);
    } else {
      const storedUser = localStorage.getItem('casino_usuario');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setRol(parsed.rol);
      }
    }

    // Cargar Datos si es JUGADOR (y tenemos usuario)
    if (usuario && usuario.rol !== 'admin') {
      cargarDatosJugador(usuario);
    }
  }, [usuario]);

  const cargarDatosJugador = async (user) => {
    // 1. Cargar Saldo Fresco
    // Intentamos obtener perfil fresco
    const resJug = await getData('usuarios/jugadores/');
    if (resJug && Array.isArray(resJug)) {
      const miPerfil = resJug.find(j => j.dni === user.dni);
      if (miPerfil) {
        setSaldo(miPerfil.cartera_monetaria);
      } else {
        setSaldo(user.cartera_monetaria || 0); // Fallback
      }
    } else {
      setSaldo(user.cartera_monetaria || 0);
    }

    // 2. Cargar Apuestas Realizadas (Cantidad)
    const resApuestas = await getData(`movimientos/apuestas/?usuario=${user.dni}`);
    if (resApuestas && Array.isArray(resApuestas)) {
      setApuestasCount(resApuestas.length);
    }
  };

  const esAdmin = rol === 'admin';

  return (
    <div className="fade-in">
      {/* HERO BANNER */}
      <div className={`hero-banner ${esAdmin ? 'admin' : 'player'}`}>
        <div>
          <h1>Hola, {esAdmin ? 'Administrador' : 'Jugador'}</h1>
          <p>
            {esAdmin
              ? 'Panel de Control del Sistema - Casino Royale'
              : 'Bienvenido a la mejor experiencia de juego online.'}
          </p>
        </div>
        <div className="status-badge">
          <span className="status-dot online"></span>
          Sistema Online
        </div>
      </div>

      {/* VISTA DE ADMINISTRADOR */}
      {esAdmin && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Usuarios Totales</h3>
              <p className="stat-number">1,245</p>
            </div>
            <div className="stat-card">
              <h3>Caja del Casino</h3>
              <p className="stat-number gold">45,200</p>
            </div>
            <div className="stat-card">
              <h3>Torneos Activos</h3>
              <p className="stat-number">8</p>
            </div>
          </div>

          <h2 className="section-title">Accesos Rápidos</h2>
          <div className="modules-grid">
            <Link to="/usuarios" className="module-card">
              <div className="icon">👤</div>
              <h3>Usuarios</h3>
              <p>Gestionar cuentas</p>
            </Link>
            <Link to="/torneos-gestion" className="module-card highlight">
              <div className="icon">🏆</div>
              <h3>Torneos</h3>
              <p>Crear y editar</p>
            </Link>
            <Link to="/finanzas" className="module-card">
              <div className="icon">💰</div>
              <h3>Finanzas</h3>
              <p>Transacciones</p>
            </Link>
            <Link to="/sesiones-global" className="module-card">
              <div className="icon">⏱️</div>
              <h3>Sesiones</h3>
              <p>Actividad global</p>
            </Link>
          </div>
        </>
      )}

      {/* VISTA DE JUGADOR */}
      {!esAdmin && rol && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Mi Saldo</h3>
              <p className="stat-number neon">{saldo}€</p>
            </div>
            <div className="stat-card">
              <h3>Mis Apuestas</h3>
              <p className="stat-number">{apuestasCount} Realizadas</p>
            </div>
            <div className="stat-card">
              <h3>Torneos Inscritos</h3>
              <p className="stat-number">2</p>
            </div>
          </div>

          <h2 className="section-title">¿A qué quieres jugar hoy?</h2>
          <div className="modules-grid">
            <Link to="/transacciones" className="module-card highlight-gold">
              <div className="icon">💳</div>
              <h3 className="text-gold">Transacciones</h3>
              <p>Depósitos y Retiros</p>
            </Link>
            <Link to="/mis-torneos" className="module-card highlight-neon">
              <div className="icon">🏆</div>
              <h3 className="text-neon">Torneos</h3>
              <p>Apúntate y compite</p>
            </Link>
            <Link to="/mis-apuestas" className="module-card highlight-neon">
              <div className="icon">🎲</div>
              <h3 className="text-neon">Apuestas</h3>
              <p>Haz tu jugada</p>
            </Link>
            <div className="module-card disabled">
              <div className="icon">🎰</div>
              <h3>Tragaperras</h3>
              <p>Próximamente</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
