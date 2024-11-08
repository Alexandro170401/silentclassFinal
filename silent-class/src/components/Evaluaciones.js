import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Evaluaciones.css';

function Evaluaciones() {
  const { cursoId } = useParams();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvaluaciones();
  }, [cursoId]);

  const fetchEvaluaciones = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/${cursoId}/evaluaciones`);
      if (!response.ok) {
        throw new Error('Error al obtener las evaluaciones');
      }
      const data = await response.json();
      setEvaluaciones(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      setError('Error al cargar las evaluaciones');
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando evaluaciones...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Evaluaciones del Curso gaaaa</h2>
      <ul>
        {evaluaciones.map((evaluacion) => (
          <li key={evaluacion.id}>
            {evaluacion.estudiante}: {evaluacion.nota} (Curso: {evaluacion.curso})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Evaluaciones;
