import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getData } from '../services/api';

function Home({ usuario }) {
  const [rol, setRol] = useState(null);
  const [saldo, setSaldo] = useState(0);
  const [apuestasCount, setApuestasCount] = useState(0);
  const [usuariosCount, setUsuariosCount] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    // Determinar ROL
    if (usuario?.rol) {
      setRol(usuario.rol);
      if (usuario.rol === 'admin') cargarDatosAdmin();
      else cargarDatosJugador(usuario);
    } else {
      const storedUser = localStorage.getItem('casino_usuario');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setRol(parsed.rol);
        if (parsed.rol === 'admin') cargarDatosAdmin();
        else cargarDatosJugador(parsed);
      }
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

  const cargarDatosAdmin = async () => {
    // Cargar total de jugadores. Podríamos sumar admins también si hubiera endpoint.
    const resJug = await getData('usuarios/jugadores/');
    if (resJug && Array.isArray(resJug)) {
      setUsuariosCount(resJug.length);
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
              <p className="stat-number">{usuariosCount}</p>
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
   
    {/* ... después de cerrar el contenido principal ... */}

      {/* FOOTER LEGAL */}
      <footer style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '40px 20px', textAlign: 'center', marginTop: '40px', borderTop: '1px solid #333' }}>
        <div className="logos-legales" style={{ marginBottom: '15px' }}>
            <span style={{ border: '1px solid white', padding: '5px 10px', borderRadius: '50%', marginRight: '15px', fontWeight: 'bold' }}>+18</span>
            <strong style={{ marginRight: '15px' }}>JUEGO SEGURO</strong> 
            <strong>JUGAR BIEN</strong>
        </div>
        
        <div className="enlaces-legales" style={{ marginTop: '10px', fontSize: '0.9em' }}>
            {/* Cambiamos el Link por un botón o un span con cursor pointer */}
            <span 
              onClick={() => setMostrarModal(true)} 
              style={{ color: '#aaa', margin: '0 10px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Política de Privacidad (RGPD)
            </span> | 
            <span style={{ color: '#aaa', margin: '0 10px' }}>Términos del Servicio</span> | 
            <span style={{ color: '#aaa', margin: '0 10px' }}>Juego Responsable</span>
        </div>
        
        <p style={{ fontSize: '0.75em', color: '#666', marginTop: '20px', maxWidth: '800px', margin: '20px auto 0' }}>
            Este casino opera bajo la licencia de la DGOJ. La base de datos está registrada conforme a la normativa de la AEPD.
        </p>
      </footer>

      {/* VENTANA EMERGENTE (MODAL) */}
      {mostrarModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#222', padding: '30px', borderRadius: '10px',
            maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
            border: '1px solid #ffd700', position: 'relative', color: '#eee'
          }}>
            <button 
              onClick={() => setMostrarModal(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ffd700', fontSize: '1.5em', cursor: 'pointer' }}
            >
              ×
            </button>
            
            <h2 style={{ color: '#ffd700' }}>Política de Privacidad (RGPD)</h2>
            <p><strong>Responsable:</strong> Casino Royale S.A.</p>
            <p><strong>Finalidad:</strong> Gestión de apuestas y cumplimiento de la Ley de Ordenación del Juego.</p>
            <p><strong>Datos Sensibles:</strong> Tratamos su DNI y datos financieros con encriptación de alto nivel para prevenir el fraude.</p>
            <p><strong>Derechos:</strong> Puede ejercer sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) contactando con nuestro delegado de protección de datos.</p>
            <hr style={{ borderColor: '#444' }} />
            <p style={{ fontSize: '0.8em' }}>Este casino cumple con las normativas de la AEPD y la DGOJ.</p>
            
            <button 
              onClick={() => setMostrarModal(false)}
              style={{ backgroundColor: '#ffd700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div> // Cierre de fade-in
    
  );
}

export default Home;
