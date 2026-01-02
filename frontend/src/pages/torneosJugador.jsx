import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function TorneosJugador() {
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    // Usamos la misma API, pero solo LEEMOS (GET)
    const data = await getData('eventos/torneos/'); 
    if (Array.isArray(data)) setTorneos(data);
  };

  const inscribirse = async (idTorneo) => {
    // Llamada a tu API para apuntarse (tabla Participa)
    // NOTA: Aquí necesitarías saber el ID del jugador real.
    // Para la demo, puedes poner un ID fijo o simularlo.
    const respuesta = await postData('eventos/competiciones/', {
        torneo: idTorneo,
        jugador: '12345678X', // <--- DNI DE PRUEBA (Debe existir en Usuarios)
        posicion: null 
    });

    if (respuesta && !respuesta.error) {
        alert("¡Te has inscrito al torneo!");
    } else {
        alert("Error al inscribirse (¿Quizás ya estás apuntado?)");
    }
  };

  return (
    <div>
      <h2 style={{color: '#00ff88'}}>🏆 Torneos Disponibles</h2>
      <p>Apúntate y gana premios increíbles.</p>

      {/* Grid de Tarjetas (Visualmente atractivo para el jugador) */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
        
        {torneos.map(t => (
          <div key={t.id} className="card" style={{borderTop: '4px solid #00ff88'}}>
            <h3>{t.nombre}</h3>
            <p style={{color:'#888', fontSize:'0.9em'}}>{t.reglas}</p>
            
            <div style={{display:'flex', justifyContent:'space-between', margin:'15px 0'}}>
                <span>📅 {t.fecha_inicio}</span>
                <span style={{color: '#d4af37', fontWeight:'bold'}}>💰 {t.premio}</span>
            </div>

            {t.estado === 'programado' || t.estado === 'abierto' ? (
                <button 
                    onClick={() => inscribirse(t.id)}
                    className="btn" 
                    style={{width:'100%', background: '#00ff88', color: '#000'}}>
                    INSCRIBIRSE ({t.precio_inscripcion}€)
                </button>
            ) : (
                <button disabled style={{width:'100%', padding:10, opacity:0.5}}>
                    TORNEO CERRADO
                </button>
            )}
          </div>
        ))}
        
        {torneos.length === 0 && <p>No hay torneos activos.</p>}
      </div>
    </div>
  );
}

export default TorneosJugador;