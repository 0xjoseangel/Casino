import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function TorneosJugador({ usuario }) {
  const [torneos, setTorneos] = useState([]);
  const [misInscripciones, setMisInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener DNI del usuario logueado
  const miDni = usuario?.dni;

  useEffect(() => {
    if (miDni) {
      cargarDatos();
    }
  }, [miDni]);

  const cargarDatos = async () => {
    setLoading(true);

    // Cargar torneos
    const dataTorneos = await getData('eventos/torneos/');
    if (Array.isArray(dataTorneos)) {
      setTorneos(dataTorneos);
    }

    // Cargar TODAS las inscripciones y filtrar las del usuario actual
    const dataCompite = await getData('eventos/competiciones/');
    if (Array.isArray(dataCompite)) {
      // El campo 'jugador' en la API devuelve el DNI (que es la PK)
      const misIds = dataCompite
        .filter(c => String(c.jugador) === String(miDni))
        .map(c => c.torneo);
      setMisInscripciones(misIds);
    }

    setLoading(false);
  };

  const inscribirse = async (idTorneo) => {
    if (!miDni) {
      alert('Error: No se pudo obtener tu DNI. Por favor, vuelve a iniciar sesión.');
      return;
    }

    const respuesta = await postData('eventos/competiciones/', {
      torneo: idTorneo,
      jugador: miDni,
      posicion: null
    });

    if (respuesta && !respuesta.error && respuesta.id) {
      alert('Te has inscrito al torneo correctamente');
      // Actualizar el estado local inmediatamente para cambiar el botón
      setMisInscripciones(prev => [...prev, idTorneo]);
    } else {
      const mensaje = respuesta?.error ||
                     respuesta?.non_field_errors?.[0] ||
                     respuesta?.detail ||
                     'Error al inscribirse. Quizás ya estás apuntado.';
      alert(mensaje);
    }
  };

  const estaInscrito = (torneoId) => {
    return misInscripciones.includes(torneoId);
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

              <div className="mb-md">
                <span className={`badge ${
                  t.estado === 'abierto' ? 'badge-success' :
                  t.estado === 'programado' ? 'badge-info' :
                  t.estado === 'en curso' ? 'badge-warning' : 'badge-error'
                }`}>
                  {t.estado.toUpperCase()}
                </span>
              </div>

              {estaInscrito(t.id) ? (
                <button className="btn btn-success btn-full" disabled>
                  Ya inscrito
                </button>
              ) : (t.estado === 'programado' || t.estado === 'abierto') ? (
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
