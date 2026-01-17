import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, postData } from '../services/api';

function MiPerfil() {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [bajaData, setBajaData] = useState({ contrasena: '', confirmacion: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Obtenemos el usuario del localStorage o de una llamada API "me"
    // Como no tenemos endpoint "me", usamos el localStorage y refrescamos datos
    useEffect(() => {
        const stored = localStorage.getItem('casino_usuario');
        if (stored) {
            const parsed = JSON.parse(stored);
            fetchUserData(parsed.dni);
        } else {
            navigate('/login');
        }
    }, []);

    const fetchUserData = async (dni) => {
        try {
            // Asumimos que podemos hacer GET de nuestro propio usuario
            // Si la API bloquea listar ID específico, usamos lo del localStorage
            // Pero lo ideal es refrescar cartera etc.
            const data = await getData(`usuarios/jugadores/${dni}/`);
            if (data && data.dni) {
                setUsuario(data);
            } else {
                // Si falla (ej: 404), usar local
                setUsuario(JSON.parse(localStorage.getItem('casino_usuario')));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBajaSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (bajaData.confirmacion !== 'ELIMINAR') {
            setError('Debes escribir ELIMINAR para confirmar.');
            return;
        }

        try {
            const response = await postData(`usuarios/jugadores/${usuario.dni}/baja_jugador/`, {
                contrasena: bajaData.contrasena,
                mensaje_confirmacion: bajaData.confirmacion
            });

            // La respuesta puede ser { message: "Baja realizada..." } o error
            if (response && response.mensaje) {
                alert("Tu cuenta ha sido dada de baja. Hasta pronto.");
                localStorage.removeItem('casino_usuario');
                window.location.href = '/login'; // Force reload/redirect
            } else {
                setError(response.error || 'Error al procesar la baja. Verifica tu contraseña.');
            }
        } catch (err) {
            setError('Error de conexión.');
        }
    };

    if (loading) return <div className="page-container">Cargando perfil...</div>;
    if (!usuario) return <div className="page-container">No se pudo cargar el usuario.</div>;

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <h1>Mi Perfil</h1>
            </div>

            <div className="card profile-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="profile-header-display">
                    <div className="avatar-circle">
                        {usuario.nombre.charAt(0)}{usuario.apellidos.charAt(0)}
                    </div>
                    <h2>{usuario.nombre} {usuario.apellidos}</h2>
                    <p className="text-muted">Jugador desde 2024</p>
                </div>

                <div className="profile-details-grid">
                    <div className="detail-item">
                        <label>DNI</label>
                        <p>{usuario.dni}</p>
                    </div>
                    <div className="detail-item">
                        <label>Email</label>
                        <p>{usuario.email}</p>
                    </div>
                    <div className="detail-item">
                        <label>Teléfono</label>
                        <p>{usuario.telefono}</p>
                    </div>
                    <div className="detail-item">
                        <label>Dirección</label>
                        <p>{usuario.direccion}</p>
                    </div>
                    <div className="detail-item highlight">
                        <label>Cartera</label>
                        <p>{usuario.cartera_monetaria} €</p>
                    </div>
                    <div className="detail-item">
                        <label>Estado</label>
                        <p>{usuario.baja ? 'Baja' : 'Activo'}</p>
                    </div>
                </div>

                <div className="profile-actions" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <button className="btn btn-danger" onClick={() => setShowModal(true)}>
                        Darme de Baja
                    </button>
                </div>
            </div>

            {/* MODAL BAJA */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>¿Estás seguro?</h3>
                        <p>Esta acción desactivará tu cuenta. Para confirmar, introduce tu contraseña y la palabra "ELIMINAR".</p>

                        <form onSubmit={handleBajaSubmit}>
                            <div className="form-group">
                                <label>Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={bajaData.contrasena}
                                    onChange={e => setBajaData({ ...bajaData, contrasena: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmación</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Escribe ELIMINAR"
                                    value={bajaData.confirmacion}
                                    onChange={e => setBajaData({ ...bajaData, confirmacion: e.target.value })}
                                    required
                                />
                            </div>

                            {error && <p className="error-message">{error}</p>}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-danger">Confirmar Baja</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MiPerfil;
