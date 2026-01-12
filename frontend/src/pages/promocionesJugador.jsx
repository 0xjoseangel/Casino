import { useEffect, useState } from 'react';
import { getData } from '../services/api';

function PromocionesJugador() {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    cargarPromos();
  }, []);

  const cargarPromos = async () => {
    const data = await getData('eventos/promociones/');
    if (Array.isArray(data)) {
        // Opcional: Filtrar en el frontend para mostrar solo las activas
        // const activas = data.filter(p => p.estado === true);
        setPromos(data); 
    }
  };

  return (
    <div>
      <h2 style={{color: '#00ff88'}}>🎁 Promociones y Bonos</h2>
      <p>Aprovecha estas ofertas exclusivas para multiplicar tu saldo.</p>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px'}}>
        
        {promos.map(p => (
          <div key={p.id} className="card" style={{
              borderLeft: `5px solid ${p.estado ? '#00ff88' : 'red'}`,
              opacity: p.estado ? 1 : 0.6
          }}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3 style={{margin:0}}>{p.nombre}</h3>
                <span style={{fontSize:'1.5rem'}}>⚡ {p.descuento}%</span>
            </div>
            
            <p style={{color:'#aaa', fontStyle:'italic', margin:'10px 0'}}>{p.descripcion}</p>
            
            <div style={{background:'#222', padding:'10px', borderRadius:'6px', textAlign:'center', margin:'15px 0', border:'1px dashed #666'}}>
                <span style={{color:'#888', fontSize:'0.8rem'}}>CÓDIGO:</span><br/>
                <span style={{color: '#d4af37', fontSize:'1.2rem', fontWeight:'bold', letterSpacing:'2px'}}>
                    {p.codigo}
                </span>
            </div>

            <div style={{fontSize:'0.8rem', color:'#666', display:'flex', justifyContent:'space-between'}}>
                <span>📅 Validez: {p.fecha_fin}</span>
                {p.estado ? (
                    <span style={{color:'#00ff88'}}>DISPONIBLE</span>
                ) : (
                    <span style={{color:'red'}}>EXPIRADA</span>
                )}
            </div>
          </div>
        ))}

        {promos.length === 0 && <p>No hay promociones disponibles en este momento.</p>}
      </div>
    </div>
  );
}

export default PromocionesJugador;