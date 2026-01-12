import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function TorneosJugador() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    const data = await getData('eventos/torneos/');
    if (Array.isArray(data)) {
      setTorneos(data);
    }
    setLoading(false);
  };

  const inscribirse = async (idTorneo) => {
    const respuesta = await postData('eventos/competiciones/', {
      torneo: idTorneo,
      jugador: '12345678X',
      posicion: null
    });

    if (respuesta && !respuesta.error) {
      alert('Te has inscrito al torneo');
    } else {
      alert('Error al inscribirse. Quizás ya estás apuntado.');
    }
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="loading">Cargando torneos...</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title neon">Torneos Disponibles</h1>
        <p className="page-subtitle">Apúntate y gana premios increíbles</p>
      </div>

      {torneos.length > 0 ? (
        <div className="modules-grid">
          {torneos.map(t => (
            <div key={t.id} className="card highlight-neon">
              <h3 className="card-title">{t.nombre}</h3>
              <p className="text-muted mb-md">{t.reglas}</p>

              <div className="flex-between mb-lg">
                <span className="text-secondary">{t.fecha_inicio}</span>
                <span className="text-gold">{t.premio}</span>
              </div>

              {t.estado === 'programado' || t.estado === 'abierto' ? (
                <button
                  onClick={() => inscribirse(t.id)}
                  className="btn btn-neon btn-full"
                >
                  Inscribirse ({t.precio_inscripcion}€)
                </button>
              ) : (
                <button className="btn btn-secondary btn-full" disabled>
                  Torneo Cerrado
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🏆</div>
            <p>No hay torneos disponibles en este momento.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TorneosJugador;
