import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import teachingImage from '../images/imagenlp.png';
import student1Image from '../images/alumno1.png';
import student2Image from '../images/alumno2.png';
import student3Image from '../images/alumno3.png';

function LandingPage() {
  const [user, setUser] = useState(null); // Estado para mantener el token o usuario
  const [nombres, setNombres] = useState([]); // Estado para mantener los nombres de la API

  // Función para obtener nombres desde la API
  const fetchNombres = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/nombres');  // Cambiar la ruta a /api/nombres
      if (!response.ok) {
        throw new Error('Error al obtener los datos del servidor'); // Manejo de errores
      }
      const data = await response.json(); // Convertir la respuesta a JSON
      setNombres(data); // Guardar los nombres en el estado
    } catch (error) {
      console.log('Error al obtener los nombres:', error); // Log del error
    }
  };

  // Efecto para verificar el estado de autenticación usando localStorage
  useEffect(() => {
    const token = localStorage.getItem('token'); // Aquí usamos el token del usuario desde localStorage
    if (token) {
      setUser(true); // Si el token existe, el usuario está logueado
    } else {
      setUser(null); // Si no hay token, el usuario no está logueado
    }
  }, []);

  // Efecto para obtener los nombres al cargar la página
  useEffect(() => {
    fetchNombres(); // Llamar a la función que obtiene los nombres
  }, []); // Este efecto se ejecuta una sola vez al montar el componente

  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Mejora tu desempeño académico hoy!</h1>
          <p>
            Si eres una persona con discapacidad auditiva nuestra página te ayudará a conocer tus puntos débiles académicamente y te recomendará qué hacer para mejorar tus notas!
          </p>
          {!user ? (
            <Link to="/signup" className="cta-button">Crear cuenta</Link>
          ) : (
            <p>¡Bienvenido a tu cuenta!</p> // Mostrar un mensaje si el usuario está logueado
          )}
        </div>
        <div className="hero-image">
          <img src={teachingImage} alt="Teaching" />
        </div>
      </div>
      <div className="students-section">
        <h3>Nuestros usuarios felices!</h3>
        <div className="student-images">
          <img src={student1Image} alt="Student 1" />
          <img src={student2Image} alt="Student 2" />
          <img src={student3Image} alt="Student 3" />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;