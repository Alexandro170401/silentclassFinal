import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Importar el contexto
import './Header.css'; // Asegúrate de que el archivo CSS esté importado

function Header() {
  const { user, logout } = useContext(AuthContext); // Obtener el usuario y la función logout
  const navigate = useNavigate();

  const handleLogout = () => {
    // Borrar localStorage
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('token'); // Si tienes un token de autenticación

    // Llamar a la función de logout si es necesario para actualizar el contexto
    logout();

    // Redirigir al usuario a la página de inicio de sesión o inicio
    navigate('/login');
  };

  return (
    <header>
      <nav>
        <ul className="left-nav">
          <li><Link to="/">SilentClass</Link></li>
          <li><Link to="/mis-evaluaciones">Notas</Link></li>
          <li><Link to="/courses">Cursos</Link></li>
        </ul>
        <ul className="right-nav">
          {user ? (
            // Si el usuario está autenticado, mostrar el botón de cerrar sesión
            <>
              <li><button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button></li>
            </>
          ) : (
            // Si no está autenticado, mostrar los botones de login y registro
            <>
              <li><Link className="login-button" to="/login">Iniciar Sesión</Link></li>
              <li><Link className="signup-button" to="/signup">Crear cuenta</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
