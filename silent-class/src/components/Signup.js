import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipousuario: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    dni: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEstudiante, setSelectedEstudiante] = useState('');
  const [dniError, setDniError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [confirmacionError, setConfirmacionError] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dni') {
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setDniError(value.length === 8 ? '' : 'Coloque un DNI válido de 8 dígitos');
      }
    } else if (name === 'correo') {
      setFormData({ ...formData, [name]: value });
      const dominiosPermitidos = ['@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com'];
      const dominioValido = dominiosPermitidos.some(dominio => value.endsWith(dominio));

      if (dominioValido) {
        setCorreoError('');
      } else {
        setCorreoError('Ingrese un correo válido (ej. usuario@gmail.com)');
      }
    } else if (name === 'contrasena') {
      setFormData({ ...formData, [name]: value });
      
      const contrasenaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (contrasenaRegex.test(value)) {
        setContrasenaError('');
      } else {
        setContrasenaError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      }
    } else if (name === 'confirmarContrasena') {
      setFormData({ ...formData, [name]: value });
      setConfirmacionError(value === formData.contrasena ? '' : 'Las contraseñas no coinciden.');
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar el cambio de tipo de usuario y cargar estudiantes si es 'Padre'
  const handleTipoUsuarioChange = (e) => {
    const tipoUsuario = e.target.value;
    setFormData({ ...formData, tipousuario: tipoUsuario });

    if (tipoUsuario === 'Padre') {
      axios.get("http://localhost:3001/api/estudiantes")
        .then(response => {
          setEstudiantes(response.data);
        })
        .catch(error => {
          console.error('Error al obtener los estudiantes:', error);
        });
    } else {
      setEstudiantes([]); // Limpiar la lista de estudiantes si el tipo de usuario cambia
    }
  };

  const handleEstudianteChange = (e) => {
    setSelectedEstudiante(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dni.length !== 8) {
      setDniError('Coloque un DNI válido de 8 dígitos');
      return;
    }
    if (correoError || contrasenaError || confirmacionError) {
      alert('Por favor corrige los errores antes de enviar');
      return;
    }

    const dataToSend = {
      ...formData,
      id_estudiante: formData.tipousuario === 'Padre' ? selectedEstudiante : null
    };

    try {
      const response = await axios.post("http://localhost:3001/api/registro", dataToSend);
      console.log('Usuario registrado:', response.data);
      alert('¡Registro exitoso! Serás redirigido a la página de inicio.');
      navigate('/');
    } catch (error) {
      console.error('Error al registrar el usuario:', error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>

      <label>
        Nombre:
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      </label>

      <label>
        Apellido Paterno:
        <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
      </label>

      <label>
        Apellido Materno:
        <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} />
      </label>

      <label>
        DNI:
        <input type="text" name="dni" value={formData.dni} onChange={handleChange} maxLength="8" required />
        {dniError && <p className="error-message">{dniError}</p>}
      </label>

      <label>
        Correo:
        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
        {correoError && <p className="error-message">{correoError}</p>}
      </label>

      <label>
        Contraseña:
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type={mostrarContrasena ? 'text' : 'password'}
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarContrasena(!mostrarContrasena)}
            style={{ marginLeft: '8px', cursor: 'pointer' }}
          >
            {mostrarContrasena ? '🔒' : '👁️'}
          </button>
        </div>
        {contrasenaError && <p className="error-message">{contrasenaError}</p>}
      </label>

      <label>
        Confirmar Contraseña:
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type={mostrarConfirmarContrasena ? 'text' : 'password'}
            name="confirmarContrasena"
            value={formData.confirmarContrasena}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
            style={{ marginLeft: '8px', cursor: 'pointer' }}
          >
            {mostrarConfirmarContrasena ? '🔒' : '👁️'}
          </button>
        </div>
        {confirmacionError && <p className="error-message">{confirmacionError}</p>}
      </label>

      <label>
        Tipo de Usuario:
        <select name="tipousuario" value={formData.tipousuario} onChange={handleTipoUsuarioChange} required>
          <option value="">Seleccionar</option>
          <option value="Docente">Docente</option>
          <option value="Estudiante">Estudiante</option>
          <option value="Padre">Padre o Apoderado</option>
        </select>
      </label>

      {formData.tipousuario === 'Padre' && (
        <label>
          Estudiante Relacionado:
          <select value={selectedEstudiante} onChange={handleEstudianteChange} required>
            <option value="">Seleccionar Estudiante</option>
            {estudiantes.map(estudiante => (
              <option key={estudiante.id} value={estudiante.id}>
                {estudiante.nombreCompleto || 'Nombre no disponible'}
              </option>
            ))}
          </select>
        </label>
      )}

      <button type="submit">Registrarse</button>
    </form>
  );
}

export default Registro;