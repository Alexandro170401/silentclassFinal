import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Usamos useNavigate para redirigir
import './Examen.css';

function Examen() {
  const { id } = useParams(); // Obtener el ID del curso desde la URL
  const [preguntas, setPreguntas] = useState([]); // Estado para las preguntas del examen
  const [respuestas, setRespuestas] = useState({}); // Estado para las respuestas del usuario
  const [curso, setCurso] = useState(null); // Estado para el curso (nombre y especialidad)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Para redirigir después de enviar el examen

  useEffect(() => {
    fetchPreguntas(); // Cargar las preguntas al montar el componente
    fetchCurso(); // Cargar la información del curso (nombre y especialidad)
  }, [id]);

  // Obtener las preguntas del examen
  const fetchPreguntas = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/examen/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener las preguntas del examen');
      }
      const data = await response.json();
      setPreguntas(data.preguntas || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      setError('Error al cargar las preguntas del examen');
      setLoading(false);
    }
  };

  // Obtener la información del curso (nombre y especialidad)
  const fetchCurso = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener los detalles del curso');
      }
      const data = await response.json();
      setCurso(data); // Guardamos el curso en el estado
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Error al cargar los detalles del curso');
    }
  };

  // Manejar el cambio de selección de respuesta
  const handleOpcionChange = (preguntaId, opcionId) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: opcionId, // Guardar la respuesta seleccionada para cada pregunta
    });
  };

  // Manejar el envío del examen
  const handleSubmit = async () => {
    const usuarioId = localStorage.getItem('usuarioId'); // Obtener usuarioId del localStorage
    
    if (!usuarioId) {
      console.error('Usuario no identificado');
      return;
    }
  
    const data = {
      cursoId: id,
      usuarioId,  // Asegurarse de incluir usuarioId en el envío
      respuestas,
      fecha: new Date().toISOString(), // Fecha actual en formato ISO
    };
  
    // Mostrar los datos que se están enviando
    console.log('Datos enviados al backend:', data);
  
    try {
      const response = await fetch('http://localhost:3001/api/evaluarExamen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Asegurarse de enviar usuarioId junto con el cuerpo
      });
  
      if (response.ok) {
        const result = await response.json();

        // Muestra el mensaje de éxito
        alert("Curso culminado exitosamente.\nEntrega de la nota y del curso recomendado.");
        
        // Redirigir a la evaluación
        navigate(`/evaluacion/${result.evaluacionId}?nombreCurso=${encodeURIComponent(curso.nombre)}&especialidad=${encodeURIComponent(curso.especialidad)}`);
      } else {
        console.error('Error en la evaluación del examen');
      }
    } catch (error) {
      console.error('Error en el envío del examen:', error);
    }
  };
  

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!preguntas || preguntas.length === 0) {
    return <p>No hay preguntas disponibles para este examen.</p>;
  }

  return (
    <div className="examen-container">
      <h2>Examen del Curso {curso && curso.nombre}</h2> {/* Mostramos el nombre del curso si está disponible */}
      <form onSubmit={handleSubmit}>
        {preguntas.map((pregunta, indexPregunta) => (
          <div key={indexPregunta} className="pregunta">
            <h3>{pregunta.pregunta}</h3>
            <div className="opciones">
              {pregunta.opciones.map((opcion, indexOpcion) => (
                <div key={indexOpcion}>
                  <label>
                    <input
                      type="radio"
                      name={`pregunta-${indexPregunta}`}
                      value={indexOpcion}
                      checked={respuestas[pregunta.id] === indexOpcion}
                      onChange={() => handleOpcionChange(pregunta.id, indexOpcion)}
                    />
                    {opcion}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" onClick={handleSubmit} className="submit-examen-button">
          Enviar Examen
        </button>
      </form>
    </div>
  );
}

export default Examen;
