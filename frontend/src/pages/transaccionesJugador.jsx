import { useEffect, useState } from 'react';
import { getData, postData } from '../services/api';

function TransaccionesJugador() {
    const [transacciones, setTransacciones] = useState([]);
    const [jugadores, setJugadores] = useState([]); // Para desplegable de transferencias
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState(null);

    const [form, setForm] = useState({
        tipo: 'DEPOSITO',
        cantidad: '',
        destinatario: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const usuarioGuardado = localStorage.getItem('casino_usuario');
        if (!usuarioGuardado) return;

        const userLocal = JSON.parse(usuarioGuardado);

        // 1. Cargar Perfil Actualizado (para asegurar saldo real)
        const resPerfil = await getData(`usuarios/perfil/?dni=${userLocal.dni}`); // Asumiendo endpoint perfil
        // Si no existe endpoint específico, usamos userLocal pero idealmente refrescaríamos
        // Voy a intentar refrescar con usuarios/jugadores/ filtrado si perfil no va, 
        // pero lo más seguro es que el endpoint de login devolvía todo.
        // MEJOR ESTRATEGIA: Cargar lista de jugadores y buscarme a mí mismo para tener el saldo fresco.

        const resJug = await getData('usuarios/jugadores/');
        if (resJug && !resJug.error) {
            setJugadores(resJug);
            const miPerfil = resJug.find(j => j.dni === userLocal.dni);
            if (miPerfil) {
                setUsuario(miPerfil); // Actualizamos con datos frescos de la BD
            } else {
                setUsuario(userLocal); // Fallback
            }
        } else {
            setUsuario(userLocal);
        }

        // 2. Cargar Transacciones del Jugador
        const resTrans = await getData(`movimientos/transacciones/?usuario=${userLocal.dni}`);
        if (resTrans && Array.isArray(resTrans)) {
            setTransacciones(resTrans);
        }

        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!usuario) return;

        const cantidadNum = parseFloat(form.cantidad);

        // Validaciones
        if (cantidadNum <= 0) {
            alert('La cantidad debe ser mayor a 0.');
            return;
        }

        if ((form.tipo === 'RETIRO' || form.tipo === 'TRANSFERENCIA') && cantidadNum > usuario.cartera_monetaria) {
            alert('⚠️ Saldo insuficiente para realizar esta operación.');
            return;
        }

        // Preparamos payload
        const payload = {
            usuario: usuario.dni, // El usuario que hace la operación soy YO
            tipo: form.tipo,
            cantidad: form.cantidad,
            destinatario: form.destinatario
        };

        const resultado = await postData('movimientos/transacciones/', payload);

        if (resultado && !resultado.error) {
            alert('Operación realizada con éxito');
            setForm({ ...form, cantidad: '', destinatario: '' });
            cargarDatos(); // Recargar historial Y SALDO
        } else {
            alert('Error en la operación. Revisa los datos o tu saldo.');
        }
    };

    const getTipoIcon = (tipo) => {
        switch (tipo) {
            case 'DEPOSITO': return '📥';
            case 'RETIRO': return '📤';
            case 'TRANSFERENCIA': return '➡️';
            default: return '💰';
        }
    };

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1 className="page-title gold">Mi Banca</h1>
                <p className="page-subtitle">Gestiona tu saldo y movimientos</p>
            </div>

            {/* BALANCE CARD */}
            {usuario && (
                <div className="card fade-in" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%)', border: '1px solid #ffd700', textAlign: 'center', padding: '2rem' }}>
                    <h2 style={{ color: '#ffd700', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1rem' }}>Saldo Disponible</h2>
                    <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 20px rgba(255, 215, 0, 0.5)', margin: '1rem 0' }}>
                        {usuario.cartera_monetaria}€
                    </div>
                </div>
            )}

            <div className="card highlight-gold" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Nueva Operación</h3>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">

                    {/* Tipo de Operación */}
                    <div className="form-group">
                        <label className="form-label">Tipo de Operación</label>
                        <select
                            value={form.tipo}
                            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                        >
                            <option value="DEPOSITO">📥 Depósito</option>
                            <option value="RETIRO">📤 Retiro</option>
                            <option value="TRANSFERENCIA">➡️ Transferencia a otro jugador</option>
                        </select>
                    </div>

                    {/* Cantidad */}
                    <div className="form-group">
                        <label className="form-label">Cantidad (€)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.cantidad}
                            onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    {/* Destinatario (Solo para Transferencia) */}
                    {form.tipo === 'TRANSFERENCIA' && (
                        <div className="form-group">
                            <label className="form-label">Destinatario (DNI/Nombre)</label>
                            <select
                                value={form.destinatario}
                                onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
                                required={form.tipo === 'TRANSFERENCIA'}
                            >
                                <option value="">Seleccionar destinatario</option>
                                {jugadores.map(j => (
                                    j.dni !== usuario?.dni && ( // No transferir a uno mismo
                                        <option key={j.dni} value={j.dni}>
                                            {j.nombre} {j.apellidos}
                                        </option>
                                    )
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Botón Submit */}
                    <div className={form.tipo === 'TRANSFERENCIA' ? '' : 'form-group'}>
                        {/* Spacer if needed or just styling correction */}
                        <label className="form-label">&nbsp;</label>
                        <button type="submit" className="btn btn-full">
                            Confirmar Operación
                        </button>
                    </div>
                </form>
            </div>

            {/* HISTORIAL */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Historial de Movimientos</h3>
                    <span className="badge badge-gold">{transacciones.length}</span>
                </div>

                {loading ? (
                    <div className="loading">Cargando movimientos...</div>
                ) : transacciones.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Información</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transacciones.map(t => (
                                    <tr key={t.id}>
                                        <td>{new Date(t.fecha).toLocaleString()}</td>
                                        <td>
                                            <span className="badge badge-gold">
                                                {getTipoIcon(t.tipo)} {t.tipo}
                                            </span>
                                        </td>
                                        <td className={`text-gold ${t.tipo === 'RETIRO' || (t.tipo === 'TRANSFERENCIA' && t.usuario === usuario?.dni) ? 'text-danger' : 'text-success'}`}>
                                            {t.tipo === 'RETIRO' || (t.tipo === 'TRANSFERENCIA' && t.usuario === usuario?.dni) ? '-' : '+'}{t.cantidad}€
                                        </td>
                                        <td className="text-muted">
                                            {t.tipo === 'TRANSFERENCIA'
                                                ? (t.usuario === usuario?.dni ? `Enviado a ${t.destinatario}` : `Recibido de ${t.usuario}`)
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="icon">💸</div>
                        <p>No has realizado movimientos aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TransaccionesJugador;
