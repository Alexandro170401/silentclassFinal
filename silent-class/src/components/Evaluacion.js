import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function Evaluacion() {
  const { evaluacionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [evaluacion, setEvaluacion] = useState(null);
  const [recomendacion, setRecomendacion] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const nombreCurso = queryParams.get('nombreCurso');
  const especialidad = queryParams.get('especialidad');

  useEffect(() => {
    fetchEvaluacion();
  }, [evaluacionId]);

  useEffect(() => {
    if (evaluacion && especialidad && evaluacion[`nota_${especialidad.toLowerCase()}`] !== undefined) {
      const notaEspecialidad = evaluacion[`nota_${especialidad.toLowerCase()}`];
      if (notaEspecialidad < 20) {
        fetchRecomendacion();
      }
    }
  }, [evaluacion, especialidad]);

  // Obtener la evaluación desde el backend
  const fetchEvaluacion = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/evaluacion/${evaluacionId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la evaluación');
      }
      const data = await response.json();
      setEvaluacion(data);
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
      setRecomendacion(data);
    } catch (error) {
      console.error('Error al obtener la recomendación:', error);
    }
  };

  // Manejar la redirección al curso recomendado
  const handleIrAlCurso = () => {
    if (recomendacion) {
      navigate(`/curso/${recomendacion.id}`);
    }
  };

  const handleVolverARealizarExamen = () => {
    navigate(-1);
  };

  if (!evaluacion) {
    return <p>Cargando...</p>;
  }

  // Mostrar la nota de la especialidad correcta con comprobación de existencia
  const mostrarNotaEspecialidad = () => {
    if (!especialidad) return <p><strong>Nota:</strong> No disponible</p>;

    const notaEspecialidad = `nota_${especialidad.toLowerCase()}`;
    if (evaluacion[notaEspecialidad] !== undefined) {
      return (
        <p><strong>Nota {especialidad}:</strong> {evaluacion[notaEspecialidad]}</p>
      );
    } else {
      return <p><strong>Nota:</strong> No disponible</p>;
    }
  };

  return (
    <div className="resultado-evaluacion">
      <h2>Resultado de la Evaluación</h2>
      <p><strong>Fecha de evaluación:</strong> {new Date(evaluacion.fecha).toLocaleString()}</p>

      {/* Mostrar la nota según la especialidad */}
      {mostrarNotaEspecialidad()}

      {evaluacion[`nota_${especialidad.toLowerCase()}`] < 20 ? (
        recomendacion ? (
          <div>
            <p><strong>Recomendación de curso:</strong> {recomendacion.nombre}</p>
            <button onClick={handleIrAlCurso}>Ir al curso recomendado</button>
          </div>
        ) : (
          <p>Cargando recomendación de curso...</p>
        )
      ) : (
        <p>No hay recomendación de curso.</p>
      )}

      <button onClick={handleVolverARealizarExamen} style={{ marginTop: '20px' }}>Volver a realizar el examen</button>
    </div>
  );
}

export default Evaluacion;