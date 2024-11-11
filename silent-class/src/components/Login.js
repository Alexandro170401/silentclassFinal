import React, { useState, useContext } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importar el contexto de autenticación

function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Usar el contexto de autenticación para gestionar el estado

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo,
          contrasena,
        }),
      });

      const result = await response.json();

      if (result && result.user) {
        // Guardar el token y los datos del usuario en localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('usuarioId', result.user.id);
        localStorage.setItem('tipoUsuario', result.user.tipoUsuario);

        // Actualizar el estado del usuario (opcional, usando Context API)
        login(result.user);

        // Redirigir al usuario a otra página (por ejemplo, al dashboard)
        navigate('/'); // Redirige a la página que desees
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
}

export default Login;