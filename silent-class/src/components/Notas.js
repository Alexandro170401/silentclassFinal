import React, { useState, useEffect } from 'react';
import './Notas.css';  // Asegúrate de crear o actualizar el archivo CSS para el diseño

function Notas() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recuperar el usuarioId de localStorage
  const usuarioId = localStorage.getItem('usuarioId');
  console.log('usuarioId:', usuarioId);  // Verificar si se obtiene correctamente

  useEffect(() => {
    if (!usuarioId) {
      setError('Usuario no identificado');
      setLoading(false);
      return;
    }

    fetchEvaluaciones();
  }, [usuarioId]);

  const fetchEvaluaciones = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/usuarios/${usuarioId}/evaluaciones`);
      console.log(`http://localhost:3001/api/usuarios/${usuarioId}/evaluaciones`);

      if (!response.ok) {
        throw new Error('Error al obtener las evaluaciones');
      }
      const data = await response.json();
      console.log('Evaluaciones recibidas:', data);

      if (Array.isArray(data)) {
        setEvaluaciones(data);  // Si es un arreglo, actualiza el estado
      } else {
        console.log('Mensaje de error:', data.message);  // Verificar el mensaje de error
        setEvaluaciones([]);  // Si no es un arreglo, usa un arreglo vacío para evitar errores
      }

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
    <div className="evaluaciones-container">
      {evaluaciones.length === 0 ? (
        <p>No hay evaluaciones disponibles</p>
      ) : (
        evaluaciones.map((evaluacion) => (
          <div className="card" key={evaluacion.id}>
            <h3>{evaluacion.curso}</h3>

            {/* Mostrar solo la nota correspondiente a la especialidad */}
            {evaluacion.especialidad === 'Matematicas' && (
              <p><strong>Notas Matemáticas:</strong> {evaluacion.nota_matematicas !== null ? evaluacion.nota_matematicas : 'Falta realizar examen'}</p>
            )}

            {evaluacion.especialidad === 'Lenguaje' && (
              <p><strong>Nota Lenguaje:</strong> {evaluacion.nota_lenguaje !== null ? evaluacion.nota_lenguaje : 'Falta realizar examen'}</p>
            )}

            {evaluacion.especialidad === 'Historia' && (
              <p><strong>Nota Historia:</strong> {evaluacion.nota_historia !== null ? evaluacion.nota_historia : 'Falta realizar examen'}</p>
            )}

            <p><strong>Fecha:</strong> {evaluacion.fecha ? new Date(evaluacion.fecha).toLocaleDateString() : 'No disponible'}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Notas;
