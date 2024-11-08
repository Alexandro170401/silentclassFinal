import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import './Examen.css';

function Examen() {
  const { id } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPreguntas();
    fetchCurso();
  }, [id]);

  const fetchPreguntas = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/examen.php?cursoId=${id}`);
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

  const fetchCurso = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/courses.php?id=${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener los detalles del curso');
      }
      const data = await response.json();
      setCurso(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Error al cargar los detalles del curso');
    }
  };

  const handleOpcionChange = (preguntaId, opcionId) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: opcionId + 1,
    });
  };

  const handleSubmit = async () => {
    const usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
      console.error('Usuario no identificado');
      return;
    }
  
    const data = {
      cursoId: id,
      usuarioId,
      respuestas,
      fecha: new Date().toISOString(),
    };
  
    console.log('Datos enviados al backend:', data);
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/evaluarExamen.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();

        // Muestra el mensaje de éxito
        alert("Curso culminado exitosamente.\nEntrega de la nota y del curso recomendado.");
        
        // Navega a la página de evaluación después de mostrar el mensaje
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
      <h2>Examen del Curso {curso && curso.nombre}</h2>

      <form onSubmit={handleSubmit}>
        {preguntas.map((pregunta, indexPregunta) => (
          <div key={indexPregunta} className="pregunta">
            <h3>{pregunta.pregunta}</h3>
            <div className="opciones">
              {pregunta.opciones.map((opcion, indexOpcion) => (
                <div key={indexOpcion}>
                  <label>
                    {opcion}
                    <br />
                    <input
                      type="radio"
                      name={`pregunta-${indexPregunta}`}
                      value={indexOpcion + 1}
                      checked={respuestas[pregunta.id] === indexOpcion + 1}
                      onChange={() => handleOpcionChange(pregunta.id, indexOpcion)}
                    />
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

