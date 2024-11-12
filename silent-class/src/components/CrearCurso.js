import React, { useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CrearCurso.css';
import { Link, useNavigate } from 'react-router-dom';

// Registrar el módulo de imágenes para ReactQuill
const ImageFormat = Quill.import('formats/image');
ImageFormat.sanitize = function(url) {
  return url;
};

function CrearCurso() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    instructor: '',
    especialidad: '',
    detalleCurso: '',
    preguntas: [],
  });

  // 5 preguntas con sus 4 respuestas
  const [preguntas, setPreguntas] = useState([
    {
      pregunta: '',
      especialidad: '',
      opciones: ['', '', '', ''],
      respuestaCorrecta: null,
    },
  ]);

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

  const handlePreguntaChange = (index, e) => {
    const newPreguntas = [...preguntas];
    newPreguntas[index][e.target.name] = e.target.value;
    setPreguntas(newPreguntas);
  };

  const handleOpcionChange = (indexPregunta, indexOpcion, value) => {
    const newPreguntas = [...preguntas];
    newPreguntas[indexPregunta].opciones[indexOpcion] = value;
    setPreguntas(newPreguntas);
  };

  const handleRespuestaCorrecta = (indexPregunta, indexOpcion) => {
    const newPreguntas = [...preguntas];
    newPreguntas[indexPregunta].respuestaCorrecta = indexOpcion;
    setPreguntas(newPreguntas);
  };

  const handleAddPregunta = () => {
    setPreguntas([
      ...preguntas,
      { pregunta: '', especialidad: '', opciones: ['', '', '', ''], respuestaCorrecta: null },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, preguntas };
    try {
      const response = await fetch('http://localhost:3001/api/crearCurso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Curso creado con éxito');
        navigate('/courses');
      } else {
        alert('Error al crear el curso: ' + result.message);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <div className="curso-container">
      <h1>Crear Curso</h1>
      <button href='/courses'>Regresar Curso</button>
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
            modules={{
              toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{size: []}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, 
                 {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image'], // Añadimos la opción de imágenes
                ['clean']
              ]
            }}
            formats={[
              'header', 'font', 'size', 
              'bold', 'italic', 'underline', 'strike', 'blockquote', 
              'list', 'bullet', 'indent', 
              'link', 'image'
            ]}
          />
        </div>

        <div>
          <h3>Preguntas</h3>
          {preguntas.map((pregunta, indexPregunta) => (
            <div key={indexPregunta} className="pregunta-container">
              <div>
                <label>Pregunta {indexPregunta + 1}:</label>
                <input
                  type="text"
                  name="pregunta"
                  value={pregunta.pregunta}
                  onChange={(e) => handlePreguntaChange(indexPregunta, e)}
                  required
                />
              </div>

              <div>
                <label>Especialidad de la pregunta:</label>
                <select
                  name="especialidad"
                  value={pregunta.especialidad}
                  onChange={(e) => handlePreguntaChange(indexPregunta, e)}
                  required
                >
                  <option value="">Seleccione una especialidad</option>
                  <option value="Matematicas">Matemáticas</option>
                  <option value="Lenguaje">Lenguaje</option>
                  <option value="Historia">Historia</option>
                </select>
              </div>

              {pregunta.opciones.map((opcion, indexOpcion) => (
                <div key={indexOpcion}>
                  <label>Opción {indexOpcion + 1}:</label>
                  <input
                    type="text"
                    value={opcion}
                    onChange={(e) => handleOpcionChange(indexPregunta, indexOpcion, e.target.value)}
                    required
                  />
                  <label>
                    <input
                      type="radio"
                      name={`respuestaCorrecta-${indexPregunta}`}
                      checked={pregunta.respuestaCorrecta === indexOpcion}
                      onChange={() => handleRespuestaCorrecta(indexPregunta, indexOpcion)}
                    />
                    Correcta
                  </label>
                </div>
              ))}
            </div>
          ))}
          <button type="button" onClick={handleAddPregunta}>
            Agregar Pregunta
          </button>
        </div>

        <button type="submit">Crear Curso</button>
      </form>
    </div>
  );
}

export default CrearCurso;
