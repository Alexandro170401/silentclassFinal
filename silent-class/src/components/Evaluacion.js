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
    if (evaluacion && evaluacion[`nota_${especialidad.toLowerCase()}`] < 20) {
      fetchRecomendacion();
    }
  }, [evaluacion, especialidad]);

  const fetchEvaluacion = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/evaluacion.php?evaluacionId=${evaluacionId}`);
      if (!response.ok) {
        throw new Error('Error al obtener la evaluación');
      }
      const data = await response.json();
      setEvaluacion(data);
    } catch (error) {
      console.error('Error al cargar la evaluación:', error);
    }
  };

  const fetchRecomendacion = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/recomendacion.php?especialidad=${especialidad}&cursoActual=${nombreCurso}`);
      if (!response.ok) {
        throw new Error('Error al obtener la recomendación');
      }
      const data = await response.json();
      setRecomendacion(data);
    } catch (error) {
      console.error('Error al obtener la recomendación:', error);
    }
  };

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

  // Mostrar la nota de la especialidad correcta
  const mostrarNotaEspecialidad = () => {
    switch (especialidad) {
      case 'Matematicas':
        return <p><strong>Nota Matemáticas:</strong> {evaluacion.nota_matematicas}</p>;
      case 'Lenguaje':
        return <p><strong>Nota Lenguaje:</strong> {evaluacion.nota_lenguaje}</p>;
      case 'Historia':
        return <p><strong>Nota Historia:</strong> {evaluacion.nota_historia}</p>;
      default:
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