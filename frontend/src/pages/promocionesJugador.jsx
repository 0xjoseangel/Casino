import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function PromocionesJugador() {
  const [promos, setPromos] = useState([]);
  const [joinedPromoIds, setJoinedPromoIds] = useState([]); // Guardamos IDs de promos a las que ya se unió
  const [loading, setLoading] = useState(true);

  // Obtener usuario del localStorage
  const usuario = JSON.parse(localStorage.getItem('casino_usuario'));

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    // 1. Cargar Promociones
    const dataPromos = await getData('eventos/promociones/');

    // 2. Cargar Participaciones del usuario actual
    const dataParticipaciones = await getData(`eventos/participaciones/?jugador=${usuario.dni}`);

    if (Array.isArray(dataPromos)) {
      setPromos(dataPromos.filter(p => p.estado === true));
    }

    if (Array.isArray(dataParticipaciones)) {
      // Extraemos los IDs de las promociones donde participa
      const ids = dataParticipaciones.map(p => p.promocion);
      setJoinedPromoIds(ids);
    }

    setLoading(false);
  };

  const handleJoin = async (promo) => {
    if (!confirm(`¿Quieres unirte a la promoción "${promo.nombre}"?`)) return;

    const res = await postData('eventos/participaciones/', {
      jugador: usuario.dni,
      promocion: promo.id
    });

    if (res.error) {
      alert(res.detail || "Error al unirse a la promoción.");
    } else {
      alert("¡Te has unido correctamente! Disfruta de tus ventajas.");
      // Recargar datos para actualizar botón
      cargarDatos();
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="loading">Cargando promociones...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title neon">Promociones y Bonos</h1>
        <p className="page-subtitle">Aprovecha estas ofertas exclusivas para multiplicar tu saldo</p>
      </div>

      {promos.length > 0 ? (
        <div className="modules-grid">
          {promos.map(p => {
            const isJoined = joinedPromoIds.includes(p.id);

            return (
              <div key={p.id} className={`card ${isJoined ? 'highlight-gold' : 'highlight-neon'}`}>
                <div className="flex-between mb-md">
                  <h3 className="card-title">{p.nombre}</h3>
                  <span className="text-gold" style={{ fontSize: '1.5rem' }}>
                    {p.beneficio}
                  </span>
                </div>

                <p className="text-muted mb-md">{p.condiciones}</p>

                <div className="card" style={{ background: 'var(--bg-light)', textAlign: 'center', padding: '16px' }}>
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>TIPO</span>
                  <div className="text-gold" style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '4px' }}>
                    {p.tipo}
                  </div>
                </div>

                <div className="flex-between mt-lg">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Válido: {p.fecha_inicio} - {p.fecha_fin}
                  </span>

                  <button
                    onClick={() => !isJoined && handleJoin(p)}
                    disabled={isJoined}
                    className={`btn ${isJoined ? 'btn-ghost' : 'btn-neon'} btn-sm`}
                    style={isJoined ? { cursor: 'default', opacity: 0.7 } : {}}
                  >
                    {isJoined ? 'YA INSCRITO ✓' : 'Unirse'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🎁</div>
            <p>No hay promociones disponibles en este momento.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromocionesJugador;
