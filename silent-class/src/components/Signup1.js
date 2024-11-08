import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import axios from 'axios';
import './Auth.css'; // Ensure you have a CSS file for styles

function Signup() {
  const [nombre, setNombre] = useState('');
  const [apellido_paterno, setApellidoPaterno] = useState('');
  const [apellido_materno, setApellidoMaterno] = useState('');
  const [dni, setDni] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [idTipoUsuario, setIdTipoUsuario] = useState(1); // Default to the first user type
  const [error, setError] = useState('');
  const [userTypes, setUserTypes] = useState([]);
  const navigate = useNavigate();

  // Fetch user types on component mount
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user-types');
        setUserTypes(response.data);
      } catch (error) {
        console.error('Error fetching user types:', error);
      }
    };

    fetchUserTypes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

     // Validate fields
     if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const nameRegex = /\d/;
    if (nameRegex.test(nombre) || nameRegex.test(apellido_paterno) || nameRegex.test(apellido_materno)) {
      setError('El nombre, apellido paterno y apellido materno no deben contener números.');
      return;
    }

    if (dni.length !== 8 || isNaN(parseInt(dni))) {
      setError('El DNI debe tener 8 dígitos.');
      return;
    }

    try {
      // Send user data to FastAPI backend
      await axios.post('http://127.0.0.1:8000/signup', {
        idtipousuario: idTipoUsuario,
        nombre,
        apellido_paterno,
        apellido_materno,
        dni: parseInt(dni),
        correo,
        contrasena,
      });

      // Create user with Firebase Authentication
      await createUserWithEmailAndPassword(auth, correo, contrasena);

      console.log('User created and data sent successfully');
      // Redirect to login page after successful signup
      navigate('/');
    } catch (error) {
      setError('Error creating user or sending data');
      console.error('Error signing up:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Crear cuenta</h2>
      <form onSubmit={handleSubmit}>
      <div>
          <label>Tipo de Usuario:</label>
          <select
            value={idTipoUsuario}
            onChange={(e) => setIdTipoUsuario(e.target.value)}
            required
          >
            {userTypes.map((userType) => (
              <option key={userType.idtipousuario} value={userType.idtipousuario}>
                {userType.tipousuario}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Apellido Paterno:</label>
          <input
            type="text"
            value={apellido_paterno}
            onChange={(e) => setApellidoPaterno(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Apellido Materno:</label>
          <input
            type="text"
            value={apellido_materno}
            onChange={(e) => setApellidoMaterno(e.target.value)}
            required
          />
        </div>
        <div>
          <label>DNI:</label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
        </div>
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
        <button type="submit">Crear cuenta</button>
      </form>
    </div>
  );
}

export default Signup;
