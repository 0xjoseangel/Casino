import { useEffect, useState } from 'react';
import { getData } from '../services/api';

function PromocionesJugador() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPromos();
  }, []);

  const cargarPromos = async () => {
    const data = await getData('eventos/promociones/');
    if (Array.isArray(data)) {
      setPromos(data);
    }
    setLoading(false);
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
          {promos.map(p => (
            <div
              key={p.id}
              className={`card ${p.estado ? 'highlight-neon' : ''}`}
              style={{ opacity: p.estado ? 1 : 0.6 }}
            >
              <div className="flex-between mb-md">
                <h3 className="card-title">{p.nombre}</h3>
                <span className="text-gold" style={{ fontSize: '1.5rem' }}>
                  {p.descuento}%
                </span>
              </div>

              <p className="text-muted mb-lg">{p.descripcion}</p>

              <div className="card" style={{ background: 'var(--bg-light)', textAlign: 'center', padding: '16px' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>CÓDIGO</span>
                <div className="text-gold" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '2px', marginTop: '4px' }}>
                  {p.codigo}
                </div>
              </div>

              <div className="flex-between mt-lg">
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Válido hasta: {p.fecha_fin}
                </span>
                <span className={`badge ${p.estado ? 'badge-success' : 'badge-error'}`}>
                  {p.estado ? 'DISPONIBLE' : 'EXPIRADA'}
                </span>
              </div>
            </div>
          ))}
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
