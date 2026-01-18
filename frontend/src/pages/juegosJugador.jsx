import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '../services/api';

const JuegosJugador = () => {
    const [juegos, setJuegos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orden, setOrden] = useState('nombre');
    const navigate = useNavigate();

    
    const colores = {
        fondo: '#0a0a0a',
        tarjeta: '#141414',
        dorado: '#d4af37',
        neon: '#B71C1C',
        texto: '#ffffff'
    };

    
    const obtenerImagenDefecto = (tipo) => {
        switch (tipo) {
            case 'tragaperras':
                return 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=600&q=80';
            case 'ruleta':
                return 'https://images.unsplash.com/photo-1625888791210-40ea41c1d0f3?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
            case 'cartas':
                return 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=600&q=80';
            default:
                return 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=600&q=80';
        }
    };

    useEffect(() => {
        fetchJuegos();
    }, []);

    const fetchJuegos = async () => {
        setLoading(true);
        const response = await getData('juegos/juegos/');
        if (response && !response.error) {
            const listaJuegos = Array.isArray(response) ? response : (response.results || []);
            setJuegos(listaJuegos);
        }
        setLoading(false);
    };

    // Lógica de ordenación
    const juegosOrdenados = [...juegos].sort((a, b) => {
        if (orden === 'nombre') return a.nombre.localeCompare(b.nombre);
        if (orden === 'tipo') return a.tipo.localeCompare(b.tipo);
        return 0;
    });

    if (loading) {
        return (
            <div style={{ color: colores.dorado, textAlign: 'center', marginTop: '100px', fontWeight: 'bold', letterSpacing: '2px' }}>
                CARGANDO EXPERIENCIA VIP...
            </div>
        );
    }

    return (
        <div className="fade-in" style={{
            padding: '40px 20px',
            backgroundColor: colores.fondo,
            minHeight: '100vh',
            fontFamily: "'Segoe UI', Roboto, sans-serif"
        }}>
            <style>{`
                .game-card-container { position: relative; height: 220px; overflow: hidden; }
                .game-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s, opacity 0.4s; }
                .game-description-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.94); color: ${colores.dorado}; display: flex;
                    align-items: center; justify-content: center; padding: 30px;
                    text-align: center; font-size: 1.05rem; opacity: 0; transition: opacity 0.4s;
                    box-sizing: border-box; border: 1px solid ${colores.dorado};
                    line-height: 1.6; font-style: italic;
                }
                .module-card { transition: all 0.4s ease; cursor: pointer; border-radius: 8px; }
                .module-card:hover { transform: translateY(-12px); border-color: ${colores.dorado} !important; box-shadow: 0 15px 35px rgba(212, 175, 55, 0.15); }
                .module-card:hover .game-image { opacity: 0.1; transform: scale(1.1); }
                .module-card:hover .game-description-overlay { opacity: 1; }
                
                .filter-select {
                    background: ${colores.tarjeta}; color: ${colores.dorado}; border: 1px solid ${colores.dorado};
                    padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; text-transform: uppercase;
                }
                .btn-play {
                    background: linear-gradient(45deg, ${colores.neon}, #9d00c4);
                    color: white; border: none; padding: 16px; border-radius: 4px;
                    font-weight: 900; cursor: pointer; transition: 0.3s;
                    text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem;
                }
                .btn-play:hover { filter: brightness(1.2); box-shadow: 0 0 25px ${colores.neon}; transform: scale(1.02); }
            `}</style>

            <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3.8rem', color: colores.texto, margin: 0, textShadow: `0 0 20px ${colores.neon}`, letterSpacing: '6px', fontWeight: '900' }}>
                    ROYAL CASINO
                </h1>
                <div style={{ height: '3px', width: '120px', background: colores.dorado, margin: '20px auto' }}></div>
                
                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' }}>
                    <span style={{ color: colores.dorado, fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '2px' }}>ORDENAR POR</span>
                    <select className="filter-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                        <option value="nombre">ALFABÉTICO (A-Z)</option>
                        <option value="tipo">CATEGORÍA</option>
                    </select>
                </div>
            </header>

            <div className="modules-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '40px', 
                maxWidth: '1300px', 
                margin: '0 auto' 
            }}>
                {juegosOrdenados.map(juego => (
                    <div key={juego.id} className="module-card" style={{ 
                        padding: 0, 
                        overflow: 'hidden', 
                        background: colores.tarjeta,
                        border: '1px solid #222'
                    }}>
                        <div className="game-card-container">
                            <img className="game-image" src={obtenerImagenDefecto(juego.tipo)} alt={juego.nombre} />
                            <div className="game-description-overlay">
                                <p>{juego.descripcion || "Disfruta de la máxima exclusividad en cada jugada. La fortuna te espera en Royal Casino."}</p>
                            </div>
                            <div style={{ 
                                position: 'absolute', top: '20px', left: '20px', background: colores.dorado, 
                                padding: '4px 14px', color: '#000', fontSize: '0.7rem',
                                fontWeight: '900', zIndex: 2, borderRadius: '2px', letterSpacing: '1px'
                            }}>
                                {juego.tipo.toUpperCase()}
                            </div>
                        </div>
                        
                        <div style={{ padding: '30px', textAlign: 'center' }}>
                            <h3 style={{ color: colores.texto, margin: '0 0 25px 0', fontSize: '1.6rem', fontWeight: '300', letterSpacing: '2px' }}>
                                {juego.nombre.toUpperCase()}
                            </h3>
                            <button 
                                className="btn-play"
                                style={{ width: '100%' }}
                                onClick={() => navigate(`/mis-apuestas?juegoId=${juego.id}`)}
                            >
                                APOSTAR AHORA
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JuegosJugador;