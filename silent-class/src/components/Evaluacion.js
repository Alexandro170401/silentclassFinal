import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // Agregar useNavigate para redirigir

function Evaluacion() {
  const { evaluacionId } = useParams(); // Obtener el ID de la evaluación desde la URL
  const location = useLocation(); // Obtener la especialidad y nombre del curso desde la URL
  const navigate = useNavigate(); // Para redirigir al usuario al curso recomendado
  const [evaluacion, setEvaluacion] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const nombreCurso = queryParams.get('nombreCurso'); // Obtener el nombre del curso de los query params
  const especialidad = queryParams.get('especialidad'); // Obtener la especialidad del curso de los query params

  useEffect(() => {
    fetchEvaluacion();
  }, [evaluacionId]);

  useEffect(() => {
    if (evaluacion && evaluacion.nota_matematicas < 20) {
      fetchRecomendacion(); // Buscar recomendación si la nota es menor que 20
    }
  }, [evaluacion]);

  // Obtener la evaluación desde el backend
  const fetchEvaluacion = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/evaluacion/${evaluacionId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la evaluación');
      }
      const data = await response.json();
      setEvaluacion(data); // Guardar la evaluación en el estado
    } catch (error) {
      console.error('Error al cargar la evaluación:', error);
    }
  };

  // Obtener una recomendación de otro curso de la misma especialidad
  const fetchRecomendacion = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/recomendacion?especialidad=${especialidad}&cursoActual=${nombreCurso}`);
      if (!response.ok) {
        throw new Error('Error al obtener la recomendación');
      }
      const data = await response.json();
      setRecomendacion(data); // Guardar la recomendación en el estado
    } catch (error) {
      console.error('Error al obtener la recomendación:', error);
    }
  };

  // Manejar la redirección al curso recomendado
  const handleIrAlCurso = () => {
    if (recomendacion) {
      navigate(`/curso/${recomendacion.id}`); // Redirigir a la página del curso recomendado
    }
  };

  if (!evaluacion) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="resultado-evaluacion">
      <h2>Resultado de la Evaluación</h2>
      <p><strong>Fecha de evaluación:</strong> {new Date(evaluacion.fecha).toLocaleString()}</p>

      {/* Mostrar solo la nota de matemáticas */}
      <p><strong>Nota Matemáticas:</strong> {evaluacion.nota_matematicas}</p>

      {/* Mostrar recomendación si la nota es menor que 20 */}
      {evaluacion.nota_matematicas < 20 ? (
        recomendacion ? (
          <div>
            <p><strong>Recomendación de curso:</strong> {recomendacion.nombre}</p>
            <button onClick={handleIrAlCurso}>Ir al curso recomendado</button> {/* Botón para redirigir */}
          </div>
        ) : (
          <p>Cargando recomendación de curso...</p>
        )
      ) : (
        <p>No hay recomendación de curso.</p>
      )}
    </div>
  );
}

export default Evaluacion;
