import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { postData } from '../services/api';

function CrearJugador() {
    const navigate = useNavigate();
    const location = useLocation();
    const fromAdmin = location.state?.fromAdmin || false;

    const [form, setForm] = useState({
        dni: '',
        nombre: '',
        apellidos: '',
        email: '',
        direccion: '',
        telefono: '',
        fecha_nacimiento: '',
        contrasena: '',
        baja: false
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await postData('usuarios/jugadores/', form);

            if (response && (response.mensaje || response.dni)) {
                setSuccess('¡Jugador registrado correctamente!');
                setTimeout(() => {
                    if (fromAdmin) {
                        navigate('/usuarios');
                    } else {
                        navigate('/login');
                    }
                }, 2000);
            } else {
                let msg = 'Error al registrar el jugador.';
                if (response.detail) {
                    msg = response.detail;
                } else if (typeof response === 'object') {
                    msg = Object.entries(response)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(' | ');
                }
                setError(msg);
            }
        } catch (err) {
            setError('Error de conexión o validación.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (fromAdmin) {
            navigate('/usuarios');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card fade-in" style={{ maxWidth: '600px' }}>
                <div className="login-header">
                    <button className="back-btn" onClick={handleBack}>&larr; Volver</button>
                    <h1>{fromAdmin ? 'Registrar Nuevo Jugador' : 'Registro de Jugador'}</h1>
                    <p>{fromAdmin ? 'Panel de Administración' : 'Únete hoy a Casino Royale'}</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">DNI (8 números + Letra)</label>
                            <input required name="dni" value={form.dni} onChange={handleChange} placeholder="12345678X" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="ejemplo@correo.com" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input required name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Apellidos</label>
                            <input required name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Tus apellidos" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Dirección</label>
                            <input required name="direccion" value={form.direccion} onChange={handleChange} placeholder="C/ Ejemplo, 123" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Teléfono</label>
                            <input required type="number" name="telefono" value={form.telefono} onChange={handleChange} placeholder="600123456" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Fecha de Nacimiento</label>
                            <input required type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input required type="password" name="contrasena" value={form.contrasena} onChange={handleChange} placeholder="****" />
                        </div>
                    </div>

                    {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
                    {success && <div className="success-message" style={{ color: '#4ade80', marginTop: '1rem', textAlign: 'center' }}>{success}</div>}

                    <button type="submit" className="btn btn-full btn-lg" disabled={loading} style={{ marginTop: '2rem' }}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CrearJugador;
