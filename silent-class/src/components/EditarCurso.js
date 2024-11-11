import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './EditarCurso.css';

function EditarCurso() {
  const { id } = useParams(); // Obtener el ID del curso desde la URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    instructor: '',
    especialidad: '',
    detalleCurso: '',
  });

  // Estado para las preguntas y sus opciones
  const [pregunta1, setPregunta1] = useState({ pregunta: '', especialidad: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '', respuestaCorrecta: null });
  const [pregunta2, setPregunta2] = useState({ pregunta: '', especialidad: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '', respuestaCorrecta: null });
  const [pregunta3, setPregunta3] = useState({ pregunta: '', especialidad: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '', respuestaCorrecta: null });
  const [pregunta4, setPregunta4] = useState({ pregunta: '', especialidad: '', opcion1: '', opcion2: '', opcion3: '', opcion4: '', respuestaCorrecta: null });

  const [loading, setLoading] = useState(true); // Iniciar en true mientras cargamos los datos

  useEffect(() => {
    // Recuperar los datos del curso y preguntas desde el backend
    fetch(`http://localhost:3001/api/courses/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setFormData({
          nombre: data.nombre,
          descripcion: data.descripcion,
          instructor: data.instructor,
          especialidad: data.especialidad,
          detalleCurso: data.detalle_curso,
        });

        // Cargar las preguntas si existen, y asegurar que siempre se asignen las opciones
        if (data.preguntas && data.preguntas.length > 0) {
          // Asegurarse de que se están cargando los valores correctos desde el backend
          setPregunta1({
            pregunta: data.preguntas[0].pregunta || '',
            especialidad: data.preguntas[0].especialidad || '',
            opcion1: data.preguntas[0].opcion1 || '',
            opcion2: data.preguntas[0].opcion2 || '',
            opcion3: data.preguntas[0].opcion3 || '',
            opcion4: data.preguntas[0].opcion4 || '',
            respuestaCorrecta: data.preguntas[0].respuesta_correcta || null // Asignar la respuesta correcta
          });

          setPregunta2({
            pregunta: data.preguntas[1]?.pregunta || '',
            especialidad: data.preguntas[1]?.especialidad || '',
            opcion1: data.preguntas[1]?.opcion1 || '',
            opcion2: data.preguntas[1]?.opcion2 || '',
            opcion3: data.preguntas[1]?.opcion3 || '',
            opcion4: data.preguntas[1]?.opcion4 || '',
            respuestaCorrecta: data.preguntas[1]?.respuesta_correcta || null
          });

          setPregunta3({
            pregunta: data.preguntas[2]?.pregunta || '',
            especialidad: data.preguntas[2]?.especialidad || '',
            opcion1: data.preguntas[2]?.opcion1 || '',
            opcion2: data.preguntas[2]?.opcion2 || '',
            opcion3: data.preguntas[2]?.opcion3 || '',
            opcion4: data.preguntas[2]?.opcion4 || '',
            respuestaCorrecta: data.preguntas[2]?.respuesta_correcta || null
          });

          setPregunta4({
            pregunta: data.preguntas[3]?.pregunta || '',
            especialidad: data.preguntas[3]?.especialidad || '',
            opcion1: data.preguntas[3]?.opcion1 || '',
            opcion2: data.preguntas[3]?.opcion2 || '',
            opcion3: data.preguntas[3]?.opcion3 || '',
            opcion4: data.preguntas[3]?.opcion4 || '',
            respuestaCorrecta: data.preguntas[3]?.respuesta_correcta || null
          });
        }

        setLoading(false); // Dejar de cargar cuando los datos se obtienen
      })
      .catch((err) => {
        console.error('Error al cargar el curso:', err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditorChange = (value) => {
    setFormData({
      ...formData,
      detalleCurso: value,
    });
  };

  // Funciones para manejar los cambios en las preguntas y sus opciones
  const handlePreguntaChange = (setPregunta, pregunta, e) => {
    const newPregunta = { ...pregunta };
    newPregunta[e.target.name] = e.target.value;
    setPregunta(newPregunta);
  };

  const handleRespuestaCorrecta = (setPregunta, pregunta, opcionIndex) => {
    const newPregunta = { ...pregunta };
    newPregunta.respuestaCorrecta = opcionIndex;
    setPregunta(newPregunta);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const preguntas = [
      {
        pregunta: pregunta1.pregunta,
        especialidad: pregunta1.especialidad,
        opcion1: pregunta1.opcion1,
        opcion2: pregunta1.opcion2,
        opcion3: pregunta1.opcion3,
        opcion4: pregunta1.opcion4,
        respuestaCorrecta: pregunta1.respuestaCorrecta,
      },
      {
        pregunta: pregunta2.pregunta,
        especialidad: pregunta2.especialidad,
        opcion1: pregunta2.opcion1,
        opcion2: pregunta2.opcion2,
        opcion3: pregunta2.opcion3,
        opcion4: pregunta2.opcion4,
        respuestaCorrecta: pregunta2.respuestaCorrecta,
      },
      {
        pregunta: pregunta3.pregunta,
        especialidad: pregunta3.especialidad,
        opcion1: pregunta3.opcion1,
        opcion2: pregunta3.opcion2,
        opcion3: pregunta3.opcion3,
        opcion4: pregunta3.opcion4,
        respuestaCorrecta: pregunta3.respuestaCorrecta,
      },
      {
        pregunta: pregunta4.pregunta,
        especialidad: pregunta4.especialidad,
        opcion1: pregunta4.opcion1,
        opcion2: pregunta4.opcion2,
        opcion3: pregunta4.opcion3,
        opcion4: pregunta4.opcion4,
        respuestaCorrecta: pregunta4.respuestaCorrecta,
      },
    ];
  
    const data = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      instructor: formData.instructor,
      especialidad: formData.especialidad,
      detalleCurso: formData.detalleCurso,
      preguntas: preguntas,
    };
  
    try {
      const response = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: 'POST', // Método PUT para actualizar
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
      if (response.ok) {
        alert('Curso actualizado con éxito');
        navigate('/courses'); // Redirigir a la lista de cursos
      } else {
        alert('Error al actualizar el curso: ' + result.message);
      }
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
      alert('Error al conectar con el servidor');
    }
  };
  
  if (loading) {
    return <p>Cargando datos del curso...</p>;
  }

  return (
    <div className="curso-container">
      <h1>Editar Curso</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre del curso:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Instructor:</label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Especialidad:</label>
          <select
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una especialidad</option>
            <option value="Matematicas">Matemáticas</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Historia">Historia</option>
          </select>
        </div>

        <div className="editor-container">
          <label>Detalle del curso:</label>
          <ReactQuill
            value={formData.detalleCurso}
            onChange={handleEditorChange}
          />
        </div>

        <div>
  <h3>Preguntas y Respuestas</h3>

{/* Pregunta 1 */}
<div className="pregunta-container">
  <label>Pregunta 1:</label>
  <input
    type="text"
    name="pregunta"
    value={pregunta1.pregunta}
    onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
    required
  />

  <div>
    <label>Especialidad de la pregunta:</label>
    <select
      name="especialidad"
      value={pregunta1.especialidad}
      onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
      required
    >
      <option value="">Seleccione una especialidad</option>
      <option value="Matematicas">Matemáticas</option>
      <option value="Lenguaje">Lenguaje</option>
      <option value="Historia">Historia</option>
    </select>
  </div>

  <div>
    <label>Opciones:</label>
    <div>
      <input
        type="text"
        name="opcion1"
        value={pregunta1.opcion1}
        onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta1"
        checked={pregunta1.respuestaCorrecta === 1}  // Comparar con el valor 0
        onChange={() => handleRespuestaCorrecta(setPregunta1, pregunta1, 1)}
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion2"
        value={pregunta1.opcion2}
        onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta1"
        checked={pregunta1.respuestaCorrecta === 2}  // Comparar con el valor 1
        onChange={() => handleRespuestaCorrecta(setPregunta1, pregunta1, 2)}
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion3"
        value={pregunta1.opcion3}
        onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta1"
        checked={pregunta1.respuestaCorrecta === 3}  // Comparar con el valor 2
        onChange={() => handleRespuestaCorrecta(setPregunta1, pregunta1, 3)}
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion4"
        value={pregunta1.opcion4}
        onChange={(e) => handlePreguntaChange(setPregunta1, pregunta1, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta1"
        checked={pregunta1.respuestaCorrecta === 4}  // Comparar con el valor 3
        onChange={() => handleRespuestaCorrecta(setPregunta1, pregunta1, 4)}
      /> Correcta
    </div>
  </div>
</div>


  {/* Pregunta 2 */}
  <div className="pregunta-container">
    <label>Pregunta 2:</label>
    <input
      type="text"
      name="pregunta"
      value={pregunta2.pregunta}
      onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
      required
    />

  <div>
    <label>Especialidad de la pregunta:</label>
    <select
      name="especialidad"
      value={pregunta2.especialidad}
      onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
      required
    >
      <option value="">Seleccione una especialidad</option>
      <option value="Matematicas">Matemáticas</option>
      <option value="Lenguaje">Lenguaje</option>
      <option value="Historia">Historia</option>
    </select>
  </div>

    <div>
      <label>Opciones:</label>
      <div>
        <input
          type="text"
          name="opcion1"
          value={pregunta2.opcion1}
          onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta2"
          checked={pregunta2.respuestaCorrecta === 1}
          onChange={() => handleRespuestaCorrecta(setPregunta2, pregunta2, 1)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion2"
          value={pregunta2.opcion2}
          onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta2"
          checked={pregunta2.respuestaCorrecta === 2}
          onChange={() => handleRespuestaCorrecta(setPregunta2, pregunta2, 2)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion3"
          value={pregunta2.opcion3}
          onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta2"
          checked={pregunta2.respuestaCorrecta === 3}
          onChange={() => handleRespuestaCorrecta(setPregunta2, pregunta2, 3)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion4"
          value={pregunta2.opcion4}
          onChange={(e) => handlePreguntaChange(setPregunta2, pregunta2, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta2"
          checked={pregunta2.respuestaCorrecta === 4}
          onChange={() => handleRespuestaCorrecta(setPregunta2, pregunta2, 4)}
        /> Correcta
      </div>
    </div>
  </div>

{/* Pregunta 3 */}
<div className="pregunta-container">
  <label>Pregunta 3:</label>
  <input
    type="text"
    name="pregunta"
    value={pregunta3.pregunta}
    onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
    required
  />

  <div>
    <label>Especialidad de la pregunta:</label>
    <select
      name="especialidad"
      value={pregunta3.especialidad}
      onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
      required
    >
      <option value="">Seleccione una especialidad</option>
      <option value="Matematicas">Matemáticas</option>
      <option value="Lenguaje">Lenguaje</option>
      <option value="Historia">Historia</option>
    </select>
  </div>

  <div>
    <label>Opciones:</label>
    <div>
      <input
        type="text"
        name="opcion1"
        value={pregunta3.opcion1}
        onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta3"
        checked={pregunta3.respuestaCorrecta === 1}  /* Cambia a 0 */
        onChange={() => handleRespuestaCorrecta(setPregunta3, pregunta3, 1)}  /* Cambia a 0 */
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion2"
        value={pregunta3.opcion2}
        onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta3"
        checked={pregunta3.respuestaCorrecta === 2}  /* Cambia a 1 */
        onChange={() => handleRespuestaCorrecta(setPregunta3, pregunta3, 2)}  /* Cambia a 1 */
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion3"
        value={pregunta3.opcion3}
        onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta3"
        checked={pregunta3.respuestaCorrecta === 3}  /* Cambia a 2 */
        onChange={() => handleRespuestaCorrecta(setPregunta3, pregunta3, 3)}  /* Cambia a 2 */
      /> Correcta
    </div>
    <div>
      <input
        type="text"
        name="opcion4"
        value={pregunta3.opcion4}
        onChange={(e) => handlePreguntaChange(setPregunta3, pregunta3, e)}
        required
      />
      <input
        type="radio"
        name="respuestaCorrecta3"
        checked={pregunta3.respuestaCorrecta === 4}  /* Cambia a 3 */
        onChange={() => handleRespuestaCorrecta(setPregunta3, pregunta3, 4)}  /* Cambia a 3 */
      /> Correcta
    </div>
  </div>
</div>

  {/* Pregunta 4 */}
  <div className="pregunta-container">
    <label>Pregunta 4:</label>
    <input
      type="text"
      name="pregunta"
      value={pregunta4.pregunta}
      onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
      required
    />

  <div>
    <label>Especialidad de la pregunta:</label>
    <select
      name="especialidad"
      value={pregunta4.especialidad}
      onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
      required
    >
      <option value="">Seleccione una especialidad</option>
      <option value="Matematicas">Matemáticas</option>
      <option value="Lenguaje">Lenguaje</option>
      <option value="Historia">Historia</option>
    </select>
  </div>
    
    <div>
      <label>Opciones:</label>
      <div>
        <input
          type="text"
          name="opcion1"
          value={pregunta4.opcion1}
          onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta4"
          checked={pregunta4.respuestaCorrecta === 1}
          onChange={() => handleRespuestaCorrecta(setPregunta4, pregunta4, 1)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion2"
          value={pregunta4.opcion2}
          onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta4"
          checked={pregunta4.respuestaCorrecta === 2}
          onChange={() => handleRespuestaCorrecta(setPregunta4, pregunta4, 2)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion3"
          value={pregunta4.opcion3}
          onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta4"
          checked={pregunta4.respuestaCorrecta === 3}
          onChange={() => handleRespuestaCorrecta(setPregunta4, pregunta4, 3)}
        /> Correcta
      </div>
      <div>
        <input
          type="text"
          name="opcion4"
          value={pregunta4.opcion4}
          onChange={(e) => handlePreguntaChange(setPregunta4, pregunta4, e)}
          required
        />
        <input
          type="radio"
          name="respuestaCorrecta4"
          checked={pregunta4.respuestaCorrecta === 4}
          onChange={() => handleRespuestaCorrecta(setPregunta4, pregunta4, 4)}
        /> Correcta
      </div>
    </div>
  </div>

</div>


        <button type="submit">Actualizar Curso</button>
      </form>
    </div>
  );
}

export default EditarCurso;
