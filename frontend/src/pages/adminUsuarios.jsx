import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData, putData } from '../services/api';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null); // DNI del usuario cuyo menú está abierto
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const data = await getData('usuarios/jugadores/');
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleEstado = async (jugador) => {
        const nuevoEstado = !jugador.baja;
        const accion = nuevoEstado ? "dar de baja" : "dar de alta";

        if (!window.confirm(`¿Estás seguro de que quieres ${accion} al usuario con DNI ${jugador.dni}?`)) return;

        try {
            // URL base
            const baseUrl = `http://127.0.0.1:8000/api/usuarios/jugadores/${jugador.dni}`;
            let url, method, body;

            if (nuevoEstado) {
                // Dar de baja (RF1.2 usando flag admin)
                url = `${baseUrl}/baja_jugador/`;
                method = 'POST';
                body = { es_admin: true };
            } else {
                // Dar de alta (RF_EXTRA)
                url = `${baseUrl}/alta_jugador/`;
                method = 'POST';
                body = {};
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                // Actualizar localmente
                setUsuarios(usuarios.map(u =>
                    u.dni === jugador.dni ? { ...u, baja: nuevoEstado } : u
                ));
                alert(`Usuario ${nuevoEstado ? 'dado de baja' : 'activado'} correctamente`);
            } else {
                alert("Error al cambiar el estado");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
        setActiveMenu(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const dataToSend = { ...editForm };
        if (!dataToSend.contrasena) delete dataToSend.contrasena;

        const res = await putData(`usuarios/jugadores/${selectedUser.dni}/`, dataToSend);
        if (res.mensaje) {
            alert(res.mensaje);
            setEditMode(false);
            setActiveMenu(null);
            fetchUsuarios();
        } else {
            alert("Error al actualizar: " + JSON.stringify(res));
        }
    };

    const openEditModal = async (user) => {
        const userData = await getData(`usuarios/jugadores/${user.dni}/`);
        setSelectedUser(userData);
        setEditForm({ ...userData, contrasena: '' });
        setEditMode(true);
        setActiveMenu('modal');
    };

    const toggleMenu = (dni, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === dni ? null : dni);
    };

    // Click fuera para cerrar menú
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="page-container fade-in">
            <div className="page-header">
                <h1>Gestión de Usuarios</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/registro', { state: { fromAdmin: true } })}
                >
                    + Registrar Nuevo Jugador
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <p>Cargando usuarios...</p>
                ) : (
                    <div className="table-responsive" style={{ minHeight: '400px' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>DNI</th>
                                    <th>Nombre</th>
                                    <th>Apellidos</th>
                                    <th>Email</th>
                                    <th>Cartera</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((u) => (
                                    <tr key={u.dni}>
                                        <td>{u.dni}</td>
                                        <td>{u.nombre}</td>
                                        <td>{u.apellidos}</td>
                                        <td>{u.email}</td>
                                        <td>{u.cartera_monetaria}€</td>
                                        <td>
                                            <span className={`badge ${u.baja ? 'badge-error' : 'badge-success'}`}>
                                                {u.baja ? 'Dado de baja' : 'Activo'}
                                            </span>
                                        </td>
                                        <td style={{ position: 'relative' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => toggleMenu(u.dni, e)}
                                                style={{ color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
                                            >
                                                &#8942;
                                            </button>
                                            {activeMenu === u.dni && (
                                                <div className="dropdown-menu show" style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    zIndex: 1000,
                                                    backgroundColor: 'white',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                    minWidth: '150px'
                                                }}>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={async () => {
                                                            const userData = await getData(`usuarios/jugadores/${u.dni}/`);
                                                            setSelectedUser(userData);
                                                            setEditMode(false);
                                                            setActiveMenu('modal');
                                                        }}
                                                        style={{
                                                            display: 'block',
                                                            width: '100%',
                                                            padding: '8px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            color: '#333',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #eee'
                                                        }}
                                                    >
                                                        Ver Datos
                                                    </button>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => openEditModal(u)}
                                                        style={{
                                                            display: 'block',
                                                            width: '100%',
                                                            padding: '8px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            color: '#333',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #eee'
                                                        }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => toggleEstado(u)}
                                                        style={{
                                                            display: 'block',
                                                            width: '100%',
                                                            padding: '8px 16px',
                                                            border: 'none',
                                                            background: 'transparent',
                                                            textAlign: 'left',
                                                            color: u.baja ? '#28a745' : '#dc3545',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {u.baja ? 'Dar de alta' : 'Dar de baja'}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {usuarios.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>No hay usuarios registrados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL DE DATOS DEL JUGADOR */}
            {
                activeMenu === 'modal' && selectedUser && (
                    <div className="modal-overlay" onClick={() => { setActiveMenu(null); setSelectedUser(null); setEditMode(false); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="text-gold">{editMode ? 'Modificar Jugador' : 'Datos del Jugador'}</h3>
                                <button className="modal-close" onClick={() => { setActiveMenu(null); setSelectedUser(null); setEditMode(false); }}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {editMode ? (
                                    <form onSubmit={handleUpdate} className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">DNI (No editable)</label>
                                            <input value={editForm.dni} disabled style={{ opacity: 0.7 }} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Nombre</label>
                                            <input
                                                value={editForm.nombre || ''}
                                                onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Apellidos</label>
                                            <input
                                                value={editForm.apellidos || ''}
                                                onChange={e => setEditForm({ ...editForm, apellidos: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Email</label>
                                            <input
                                                value={editForm.email || ''}
                                                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                                required
                                                type="email"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Teléfono</label>
                                            <input
                                                value={editForm.telefono || ''}
                                                onChange={e => setEditForm({ ...editForm, telefono: e.target.value })}
                                                required
                                                type="number"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Dirección</label>
                                            <input
                                                value={editForm.direccion || ''}
                                                onChange={e => setEditForm({ ...editForm, direccion: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Nueva Contraseña (Opcional)</label>
                                            <input
                                                value={editForm.contrasena || ''}
                                                onChange={e => setEditForm({ ...editForm, contrasena: e.target.value })}
                                                placeholder="Dejar vacía para mantener actual"
                                                type="password"
                                            />
                                        </div>
                                        <div className="full-width" style={{ marginTop: '20px' }}>
                                            <button type="submit" className="btn btn-primary btn-full">
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="user-details-grid">
                                        <div className="detail-item">
                                            <label>DNI</label>
                                            <p>{selectedUser.dni}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Nombre Completo</label>
                                            <p>{selectedUser.nombre} {selectedUser.apellidos}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Email</label>
                                            <p>{selectedUser.email}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Teléfono</label>
                                            <p>{selectedUser.telefono}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Dirección</label>
                                            <p>{selectedUser.direccion}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Fecha de Nacimiento</label>
                                            <p>{new Date(selectedUser.fecha_nacimiento).toLocaleDateString()}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Cartera</label>
                                            <p className="text-gold font-bold">{selectedUser.cartera_monetaria}€</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Estado</label>
                                            <span className={`badge ${selectedUser.baja ? 'badge-error' : 'badge-success'}`}>
                                                {selectedUser.baja ? 'Dado de baja' : 'Activo'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    animation: fadeIn 0.2s ease-out;
                }
                
                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    width: 90%;
                    max-width: 600px;
                    box-shadow: var(--shadow-xl);
                    animation: slideUp 0.3s ease-out;
                }
                
                .modal-header {
                    padding: var(--space-lg);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 2rem;
                    line-height: 1;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .modal-close:hover {
                    color: var(--text-primary);
                }
                
                .modal-body {
                    padding: var(--space-lg);
                }
                
                .user-details-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-lg);
                }
                
                .detail-item label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-bottom: var(--space-xs);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .detail-item p {
                    margin: 0;
                    font-size: 1.1rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default AdminUsuarios;
