import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to the homepage after successful login
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError('No hay ningún usuario registrado con este correo electrónico.');
      } else if (error.code === 'auth/wrong-password') {
        setError('La contraseña es incorrecta.');
      } else {
        setError('Error al iniciar sesión: ' + error.message);
      }
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default Login;
