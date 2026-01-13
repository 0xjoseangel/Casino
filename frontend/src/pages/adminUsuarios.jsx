import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getData } from '../services/api';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null); // DNI del usuario cuyo menú está abierto
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
            const response = await fetch(`http://127.0.0.1:8000/api/usuarios/jugadores/${jugador.dni}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ baja: nuevoEstado })
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
                                            <span className={`badge ${u.baja ? 'badge-danger' : 'badge-success'}`}>
                                                {u.baja ? 'Baja' : 'Activo'}
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
        </div>
    );
}

export default AdminUsuarios;
