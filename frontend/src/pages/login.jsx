import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '../services/api';

function Login({ setUsuario }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ dni: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await postData('usuarios/login/', form);

      if (response && response.exito) {
        const usuarioLogueado = {
          rol: response.rol,
          ...response.usuario
        };

        localStorage.setItem('casino_usuario', JSON.stringify(usuarioLogueado));
        setUsuario(usuarioLogueado);

        if (response.rol === 'admin') {
          navigate('/dashboard');
        } else {
          navigate('/mis-torneos');
        }
      } else {
        setError('DNI o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <h1>CASINO LASAÑA</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">DNI Usuario</label>
            <input
              name="dni"
              placeholder="Introduce tu DNI"
              value={form.dni}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              placeholder="Introduce tu contraseña"
              value={form.contrasena}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-full btn-lg" disabled={loading}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p><strong>Admin:</strong> 88888888A / admin123</p>
          <p><strong>Jugador:</strong> 12345678X / 1234</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
