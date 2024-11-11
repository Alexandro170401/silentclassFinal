import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import './CursoDetalle.css';

function CursoDetalle() {
  const { id } = useParams(); // Obtener el ID del curso desde la URL
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Definir el hook useNavigate para redirigir

  useEffect(() => {
    fetchCurso();
  }, [id]);

  const fetchCurso = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el curso');
      }
      const data = await response.json();
      setCurso(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Error al cargar el curso');
      setLoading(false);
    }
  };

  const handleRealizarExamen = () => {
    navigate(`/examen/${id}`); // Redirigir a la página de examen del curso actual
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="curso-detalle-container">
      {curso ? (
        <div className="curso-detalle">
          <h2>{curso.nombre}</h2>
          <p><strong>Descripción:</strong> {curso.descripcion}</p>
          <p><strong>Instructor:</strong> {curso.instructor}</p>
          <p><strong>Especialidad:</strong> {curso.especialidad}</p>
          <div className="detalle-curso">
            <h3>Detalles del curso</h3>
            <div dangerouslySetInnerHTML={{ __html: curso.detalle_curso }} />
          </div>
          {/* Botón para realizar el examen */}
          <button className="realizar-examen-button" onClick={handleRealizarExamen}>
            Realizar Examen
          </button>
        </div>
      ) : (
        <p>No se encontró el curso.</p>
      )}
    </div>
  );
}

export default CursoDetalle;
