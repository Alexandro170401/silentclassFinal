import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Courses.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false); // Estado para la sesión activa o no
  const [validUser, setValidUser] = useState(false); // Estado para verificar si es Docente o Estudiante
  const navigate = useNavigate();

  // Obtener el token o usuarioId y el tipo de usuario desde el localStorage
  const usuarioId = localStorage.getItem('usuarioId');
  const tipoUsuario = localStorage.getItem('tipoUsuario'); // Obtenemos el tipo de usuario

  useEffect(() => {
    // Verificar si el usuario tiene una sesión iniciada
    if (!usuarioId) {
      setSessionActive(false); // No hay sesión activa
      setLoading(false); // Dejar de cargar porque no se necesitan datos
    } else {
      setSessionActive(true); // Hay sesión activa
      if (tipoUsuario === 'Docente' || tipoUsuario === 'Estudiante') {
        setValidUser(true); // Usuario válido
        fetchCourses(); // Cargar los cursos si es Docente o Estudiante
      } else {
        setValidUser(false); // No es un usuario válido
        setLoading(false);
      }
    }
  }, [usuarioId, tipoUsuario]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/mostrarCursos.php`); // Asegúrate de que el endpoint está correcto
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCourses(data);
      setLoading(false); // Dejar de cargar cuando los datos se obtienen
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false); // Dejar de cargar si hay un error
    }
  };

  const handleCreateCourse = () => {
    navigate('/crearcurso');
  };

  const handleCourseClick = (id) => {
    navigate(`/curso/${id}`); // Redirigir a la vista de detalles del curso
  };

  // Nueva función para manejar la edición del curso
  const handleEditCourse = (id) => {
    navigate(`/editar-curso/${id}`); // Redirigir a la página de edición del curso
  };

  if (loading) {
    return <p>Cargando...</p>; // Mostrar mientras se cargan los datos
  }

  // Si no hay sesión activa, mostrar el mensaje de "Usuario no identificado"
  if (!sessionActive) {
    return <p>Usuario no identificado, debes iniciar sesión</p>;
  }

  // Si el tipo de usuario no es válido, no mostrar nada
  if (!validUser) {
    return null; // No renderizar nada si no es Docente o Estudiante
  }

  return (
    <div className="courses-container">
      <h2>Cursos</h2>

      {/* Mostrar el botón de "Crear Curso" solo si el tipo de usuario es "Docente" */}
      {tipoUsuario === 'Docente' && (
        <button className="create-course-button" onClick={handleCreateCourse}>
          Crear Curso
        </button>
      )}

      <div className="courses-list">
        {courses.length > 0 ? (
          courses.map(course => (
            <div 
              key={course.id} 
              className="course-card"
            >
              <h3>{course.nombre}</h3>
              <p>{course.descripcion}</p>
              <p><strong>Instructor:</strong> {course.instructor}</p>
              <p><strong>Especialidad:</strong> {course.especialidad}</p>

              {/* Si el usuario es docente, mostrar el botón "Editar Curso" */}
              {tipoUsuario === 'Docente' && (
                <button className="edit-course-button" onClick={() => handleEditCourse(course.id)}>
                  Editar Curso
                </button>
              )}

              {/* Hacer clic en cualquier parte de la tarjeta llevará al detalle del curso */}
              <button className="view-course-button" onClick={() => handleCourseClick(course.id)}>
                Ver Curso
              </button>
            </div>
          ))
        ) : (
          <p>No hay cursos disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default Courses;
