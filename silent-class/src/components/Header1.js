import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Import your Firebase auth instance
import './Header.css'; // Ensure you import the CSS file

function Header() {
  const [user, setUser] = useState(null); // State to hold the current user

  useEffect(() => {
    // Firebase listener to check authentication state
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user); // User is signed in
      } else {
        setUser(null); // No user is signed in
      }
    });

    // Clean-up function
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null); // Reset user state
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <header>
      <nav>
        <ul className="left-nav">
          <li><Link to="/">SilentClass</Link></li>
          <li><Link to="/exam">Examen</Link></li>
          <li><Link to="/exam-result">Notas</Link></li>
          <li><Link to="/courses">Cursos</Link></li>
        </ul>
        <ul className="right-nav">
          {user ? (
            // If user is logged in, show the signout button
            <>
              <li><button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button></li>
            </>
          ) : (
            // If user is not logged in, show the login and signup buttons
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
