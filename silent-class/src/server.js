const express = require('express');
const mysql = require('mysql');  // Usamos mysql2 para soporte async/await
const cors = require('cors');
const bcrypt = require('bcrypt'); // Para encriptar y comparar contraseñas
const jwt = require('jsonwebtoken'); // Para generar un token de autenticación (opcional)
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

// Middleware para analizar cuerpos de JSON
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Configuración de conexión a la base de datos MySQL
const DB  = mysql.createConnection({
    host: 'localhost',      // Dirección del host MySQL (ej: localhost o tu IP de HostGator)
    user: 'root',         // Usuario de la base de datos MySQL
    password: '',    // Contraseña del usuario MySQL
    database: 'silentclass',    // Nombre de la base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Conexión a la base de datos
DB.connect((err) => {
  if (err) {
      throw err;
  }
  console.log('Conexión exitosa!!');
});

// Definición de la ruta para obtener una evaluación por ID

app.get('/api/evaluacion/:id', (req, res) => {
  const evaluacionId = req.params.id;

  // Consulta SQL para obtener la evaluación
  const query = 'SELECT * FROM evaluaciones WHERE id = ?';
  
  DB.query(query, [evaluacionId], (err, results) => {
      if (err) {
          // Manejar el error de la base de datos
          console.error('Error al obtener la evaluación:', err);
          return res.status(500).json({ error: 'Error al obtener la evaluación' });
      }

      if (results.length === 0) {
          // No se encontró la evaluación
          return res.status(404).json({ error: 'Evaluación no encontrada' });
      }

      // Devolver los resultados de la evaluación
      res.json(results[0]);
  });
});

// Ruta para obtener la lista de estudiantes
app.get('/api/estudiantes', (req, res) => {
  const sql = 'SELECT id, nombre, apellido_paterno, apellido_materno FROM usuarios WHERE tipousuario = "Estudiante"';

  DB.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los estudiantes:', err);
      return res.status(500).json({ message: 'Error al obtener los estudiantes' });
    }

    // Asegurarse de que nombre y apellidos no sean null antes de concatenar
    res.json(result.map(estudiante => ({
      id: estudiante.id,
      nombreCompleto: `${estudiante.nombre || ''} ${estudiante.apellido_paterno || ''} ${estudiante.apellido_materno || ''}`.trim()
    })));
  });
});

// Ruta para obtener nombres de usuarios
//API php nombres
app.get('/api/nombres', (req, res) => {
  const SQL_QUERY = 'SELECT nombre FROM usuarios';  // Consulta para obtener los nombres de la tabla usuario
  DB.query(SQL_QUERY, (err, result) => {
      if (err) {
          throw err;  // Manejo de errores
      }
      res.json(result);  // Devolver los nombres en formato JSON
  });
});

// Ruta para iniciar sesión
//API php login
app.post('/api/login', (req, res) => {
  const { correo, contrasena } = req.body;

  // Verificar el correo y la contraseña
  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  DB.query(sql, [correo], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];

    // Verificar la contraseña (si está en texto plano o usando bcrypt si está encriptada)
    const passwordMatch = user.contrasena === contrasena;  // Si usas contraseñas planas, de lo contrario usar bcrypt.compare

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Si el usuario es un padre, buscar al estudiante relacionado
    if (user.tipousuario === 'Padre') {
      const relationSql = 'SELECT id_estudiante FROM padre_estudiante WHERE id_padre = ?';
      DB.query(relationSql, [user.id], (err, relationResult) => {
        if (err || relationResult.length === 0) {
          return res.status(500).json({ message: 'No se pudo obtener la relación con el estudiante' });
        }

        const estudianteId = relationResult[0].id_estudiante;

        // Generar el token y devolver la información del estudiante
        const token = jwt.sign({ userId: user.id, correo: user.correo }, 'your_jwt_secret', {
          expiresIn: '1h',
        });

        res.json({
          message: 'Inicio de sesión exitoso',
          user: {
            id: user.id,
            tipoUsuario: user.tipousuario,
            nombre: user.nombre,
            correo: user.correo,
            estudianteRelacionado: estudianteId, // Devolver el id del estudiante relacionado
          },
          token,
        });
      });
    } else {
      // Para otros usuarios (Docente, Estudiante)
      const token = jwt.sign({ userId: user.id, correo: user.correo }, 'your_jwt_secret', {
        expiresIn: '1h',
      });

      res.json({
        message: 'Inicio de sesión exitoso',
        user: {
          id: user.id,
          tipoUsuario: user.tipousuario,
          nombre: user.nombre,
          correo: user.correo,
        },
        token,
      });
    }
  });
});

// Ruta para crear un nuevo usuario (incluyendo "Padre")
// API php registro
app.post('/api/registro', (req, res) => {
  const { tipousuario, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena, id_estudiante } = req.body;

  const sql = 'INSERT INTO usuarios (tipousuario, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [tipousuario, nombre, apellido_paterno, apellido_materno || null, dni, correo, contrasena];

  // Consulta SQL para registrar el usuario
  DB.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar el usuario:', err);  // Imprimir error completo en la consola
      return res.status(500).json({ message: 'Error al crear el usuario', error: err.message });
    }

    const userId = result.insertId;

    // Si el usuario es "Padre", debemos crear la relación con el estudiante
    if (tipousuario === 'Padre') {
      const relationSql = 'INSERT INTO padre_estudiante (id_padre, id_estudiante) VALUES (?, ?)';
      DB.query(relationSql, [userId, id_estudiante], (err) => {
        if (err) {
          console.error('Error al crear la relación entre padre y estudiante:', err);  // Imprimir error completo en la consola
          return res.status(500).json({ message: 'Error al crear la relación padre-estudiante', error: err.message });
        }
      });
    }

    res.json({ message: 'Usuario registrado con éxito', userId });
  });
});

app.get('/api/usuarios/:usuarioId/evaluaciones', (req, res) => {
  const { usuarioId } = req.params;

  // Verifica el tipo de usuario
  const sql = 'SELECT tipousuario FROM usuarios WHERE id = ?';
  DB.query(sql, [usuarioId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: 'Error al verificar el tipo de usuario' });
    }

    const tipoUsuario = result[0].tipousuario;

    if (tipoUsuario === 'Padre') {
      // Verificar si el usuario es padre
      const relationSql = 'SELECT id_estudiante FROM padre_estudiante WHERE id_padre = ?';
      DB.query(relationSql, [usuarioId], (err, relationResult) => {
        if (err || relationResult.length === 0) {
          return res.status(500).json({ message: 'No se pudo obtener el estudiante relacionado' });
        }

        const estudianteId = relationResult[0].id_estudiante;
        console.log('Estudiante relacionado:', estudianteId);  // Log para verificar el ID del estudiante

        // Obtener evaluaciones del estudiante relacionado
        obtenerEvaluaciones(estudianteId, res);
      });
    } else {
      console.log('Usuario ID consultado:', usuarioId);  // Verifica que el usuarioId sea el correcto
      obtenerEvaluaciones(usuarioId, res);  // Obtener evaluaciones del propio usuario
    }
  });
});

// Función auxiliar para obtener evaluaciones del estudiante o del usuario
function obtenerEvaluaciones(usuarioId, res) {
  const query = `
    SELECT e.id, c.nombre AS curso, c.especialidad, e.nota_matematicas, e.nota_lenguaje, e.nota_historia, e.fecha
    FROM evaluaciones e
    JOIN cursos c ON e.curso_id = c.id
    WHERE e.usuario_id = ?
  `;

  DB.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error('Error al obtener las evaluaciones:', err);
      return res.status(500).json({ error: 'Error al obtener las evaluaciones' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones para este usuario.' });
    }

    console.log('Evaluaciones obtenidas:', results);  // Log para verificar los resultados
    res.json(results);
  });
}

// Ruta para crear un curso
//API php crearCurso
app.post('/api/crearCurso', (req, res) => {
  const { nombre, descripcion, instructor, especialidad, detalleCurso, preguntas } = req.body;

  // Consulta para insertar los datos del curso en la base de datos
  const sql = `INSERT INTO cursos (nombre, descripcion, instructor, especialidad, detalle_curso) 
               VALUES (?, ?, ?, ?, ?)`;

  // Valores que serán insertados
  const values = [nombre, descripcion, instructor, especialidad, detalleCurso];

  // Ejecutar la consulta
  DB.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar el curso:', err);
      return res.status(500).json({ message: 'Error al crear el curso' });
    }

    const cursoId = result.insertId;  // Obtener el ID del curso creado
    console.log('Curso creado con éxito, ID:', cursoId);

    // Ahora insertamos las preguntas asociadas al curso
    if (preguntas && preguntas.length > 0) {
      const preguntaSql = `INSERT INTO preguntas (curso_id, pregunta, especialidad, opcion1, opcion2, opcion3, opcion4, respuesta_correcta)
                           VALUES ?`;

      const preguntasValues = preguntas.map(pregunta => [
        cursoId, 
        pregunta.pregunta, 
        pregunta.especialidad, 
        pregunta.opciones[0], 
        pregunta.opciones[1], 
        pregunta.opciones[2], 
        pregunta.opciones[3], 
        pregunta.respuestaCorrecta
      ]);

      // Ejecutar la consulta para insertar las preguntas
      DB.query(preguntaSql, [preguntasValues], (err, result) => {
        if (err) {
          console.error('Error al insertar preguntas:', err);
          return res.status(500).json({ message: 'Error al crear las preguntas del curso' });
        }

        res.json({ message: 'Curso y preguntas creadas con éxito' });
      });
    } else {
      res.json({ message: 'Curso creado con éxito, sin preguntas' });
    }
  });
});

app.put('/api/editarcurso', (req, res) => {
  const { nombre, descripcion, instructor, especialidad, detalleCurso, preguntas } = req.body;

  // Consulta para insertar los datos del curso en la base de datos
  const sql = `INSERT INTO cursos (nombre, descripcion, instructor, especialidad, detalle_curso) 
               VALUES (?, ?, ?, ?, ?)`;

  // Valores que serán insertados
  const values = [nombre, descripcion, instructor, especialidad, detalleCurso];

  // Ejecutar la consulta
  DB.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar el curso:', err);
      return res.status(500).json({ message: 'Error al crear el curso' });
    }

    const cursoId = result.insertId;  // Obtener el ID del curso creado
    console.log('Curso creado con éxito, ID:', cursoId);

    // Ahora insertamos las preguntas asociadas al curso
    if (preguntas && preguntas.length > 0) {
      const preguntaSql = `INSERT INTO preguntas (curso_id, pregunta, especialidad, opcion1, opcion2, opcion3, opcion4, respuesta_correcta)
                           VALUES ?`;

      const preguntasValues = preguntas.map(pregunta => [
        cursoId, 
        pregunta.pregunta, 
        pregunta.especialidad, 
        pregunta.opciones[0], 
        pregunta.opciones[1], 
        pregunta.opciones[2], 
        pregunta.opciones[3], 
        pregunta.respuestaCorrecta
      ]);

      // Ejecutar la consulta para insertar las preguntas
      DB.query(preguntaSql, [preguntasValues], (err, result) => {
        if (err) {
          console.error('Error al insertar preguntas:', err);
          return res.status(500).json({ message: 'Error al crear las preguntas del curso' });
        }

        res.json({ message: 'Curso y preguntas creadas con éxito' });
      });
    } else {
      res.json({ message: 'Curso creado con éxito, sin preguntas' });
    }
  });
});

// Ruta para obtener todos los cursos
app.get('/api/courses', (req, res) => {
  const sql = 'SELECT * FROM cursos';

  DB.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los cursos:', err);
      return res.status(500).json({ message: 'Error al obtener los cursos' });
    }
    
    res.json(result); // Devolver los cursos en formato JSON
  });
});

// Ruta para obtener un curso específico por su ID
app.get('/api/courses/:id', (req, res) => {
  const cursoId = req.params.id;
  
  const sqlCurso = 'SELECT * FROM cursos WHERE id = ?';
  const sqlPreguntas = 'SELECT * FROM preguntas WHERE curso_id = ?';

  DB.query(sqlCurso, [cursoId], (err, cursoResult) => {
    if (err) {
      console.error('Error al obtener el curso:', err);
      return res.status(500).json({ message: 'Error al obtener el curso' });
    }

    if (cursoResult.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    DB.query(sqlPreguntas, [cursoId], (err, preguntasResult) => {
      if (err) {
        console.error('Error al obtener las preguntas del curso:', err);
        return res.status(500).json({ message: 'Error al obtener las preguntas' });
      }

      const curso = cursoResult[0];
      curso.preguntas = preguntasResult; // Agregar las preguntas al objeto curso

      res.json(curso); // Devolver el curso con sus preguntas
    });
  });
});

// Ruta para actualizar un curso existente
// API php updateCourse
app.put('/api/courses/:id', async (req, res) => {
  const cursoId = req.params.id;
  const { nombre, descripcion, instructor, especialidad, detalleCurso, preguntas } = req.body;

  // Consulta para actualizar los datos del curso
  const sqlCurso = `
    UPDATE cursos 
    SET nombre = ?, descripcion = ?, instructor = ?, especialidad = ?, detalle_curso = ?
    WHERE id = ?`;

  const valuesCurso = [nombre, descripcion, instructor, especialidad, detalleCurso, cursoId];

  try {
    // Actualizar el curso
    await new Promise((resolve, reject) => {
      DB.query(sqlCurso, valuesCurso, (err, result) => {
        if (err) {
          console.error('Error al actualizar el curso:', err);
          return reject(err);
        }
        resolve(result);
      });
    });

    // Eliminar todas las preguntas relacionadas con el curso
    const sqlDeletePreguntas = 'DELETE FROM preguntas WHERE curso_id = ?';
    await new Promise((resolve, reject) => {
      DB.query(sqlDeletePreguntas, [cursoId], (err, result) => {
        if (err) {
          console.error('Error al eliminar las preguntas:', err);
          return reject(err);
        }
        resolve(result);
      });
    });

    // Insertar las nuevas preguntas
    if (preguntas && preguntas.length > 0) {
      const sqlInsertPreguntas = `
        INSERT INTO preguntas (curso_id, pregunta, especialidad, opcion1, opcion2, opcion3, opcion4, respuesta_correcta)
        VALUES ?`;

      const preguntasValues = preguntas.map(pregunta => [
        cursoId, 
        pregunta.pregunta, 
        pregunta.especialidad, 
        pregunta.opcion1, 
        pregunta.opcion2, 
        pregunta.opcion3, 
        pregunta.opcion4, 
        pregunta.respuestaCorrecta
      ]);

      await new Promise((resolve, reject) => {
        DB.query(sqlInsertPreguntas, [preguntasValues], (err, result) => {
          if (err) {
            console.error('Error al insertar nuevas preguntas:', err);
            return reject(err);
          }
          resolve(result);
        });
      });
    }

    // Responder al cliente
    res.json({ message: 'Curso y preguntas actualizados con éxito' });

  } catch (err) {
    // Manejar errores
    console.error('Error en la operación:', err);
    res.status(500).json({ message: 'Error al actualizar el curso o las preguntas' });
  }
});

// Ruta para obtener las preguntas del examen de un curso específico
app.get('/api/examen/:cursoId', (req, res) => {
  const cursoId = req.params.cursoId;

  const sql = 'SELECT * FROM preguntas WHERE curso_id = ?';

  DB.query(sql, [cursoId], (err, result) => {
    if (err) {
      console.error('Error al obtener las preguntas:', err);
      return res.status(500).json({ message: 'Error al obtener las preguntas del examen' });
    }

    const preguntasFormateadas = result.map(pregunta => ({
      id: pregunta.id,
      pregunta: pregunta.pregunta,
      especialidad: pregunta.especialidad,
      opciones: [pregunta.opcion1, pregunta.opcion2, pregunta.opcion3, pregunta.opcion4],
      respuestaCorrecta: pregunta.respuesta_correcta
    }));

    res.json({ preguntas: preguntasFormateadas });
  });
});

app.post('/api/evaluarExamen', (req, res) => {
  const { cursoId, usuarioId, respuestas, fecha } = req.body;  // Obtener usuarioId del cuerpo de la solicitud

  if (!usuarioId) {
    return res.status(400).json({ message: 'El usuarioId es requerido.' });
  }

  // Obtener la fecha del servidor en UTC y restar 5 horas para ajustarla a GMT-5 (Perú)
  const fechaAjustada = new Date(new Date().getTime() - 5 * 60 * 60 * 1000).toISOString();

  // Obtener las preguntas del curso
  const sql = 'SELECT * FROM preguntas WHERE curso_id = ?';

  DB.query(sql, [cursoId], (err, preguntas) => {
    if (err) {
      console.error('Error al obtener las preguntas del curso:', err);
      return res.status(500).json({ message: 'Error al obtener las preguntas del examen' });
    }

    let correctasMatematicas = 0;
    let correctasLenguaje = 0;
    let correctasHistoria = 0;
    let totalMatematicas = 0;
    let totalLenguaje = 0;
    let totalHistoria = 0;

    preguntas.forEach(pregunta => {
      const respuestaUsuario = respuestas[pregunta.id];
      if (respuestaUsuario !== undefined && respuestaUsuario == pregunta.respuesta_correcta) {
        // Incrementar la nota dependiendo de la especialidad de la pregunta
        switch (pregunta.especialidad) {
          case 'Matematicas':
            correctasMatematicas++;
            totalMatematicas++;
            break;
          case 'Lenguaje':
            correctasLenguaje++;
            totalLenguaje++;
            break;
          case 'Historia':
            correctasHistoria++;
            totalHistoria++;
            break;
        }
      } else {
        // Si la respuesta es incorrecta, también contabilizamos la pregunta
        switch (pregunta.especialidad) {
          case 'Matematicas':
            totalMatematicas++;
            break;
          case 'Lenguaje':
            totalLenguaje++;
            break;
          case 'Historia':
            totalHistoria++;
            break;
        }
      }
    });

    // Calcular las notas de 0 a 20
    const notaMatematicas = totalMatematicas > 0 ? (correctasMatematicas / totalMatematicas) * 20 : 0;
    const notaLenguaje = totalLenguaje > 0 ? (correctasLenguaje / totalLenguaje) * 20 : 0;
    const notaHistoria = totalHistoria > 0 ? (correctasHistoria / totalHistoria) * 20 : 0;

    // Guardar la evaluación en la base de datos
    const sqlInsert = 'INSERT INTO evaluaciones (curso_id, usuario_id, fecha, nota_matematicas, nota_lenguaje, nota_historia) VALUES (?, ?, ?, ?, ?, ?)';
    DB.query(sqlInsert, [cursoId, usuarioId, fecha, notaMatematicas, notaLenguaje, notaHistoria], (err, result) => {
      if (err) {
        console.error('Error al guardar la evaluación:', err);
        return res.status(500).json({ message: 'Error al guardar la evaluación' });
      }

      res.json({ evaluacionId: result.insertId });
    });
  });
});

// API php recomendacion
app.get('/api/recomendacion', (req, res) => {
  const { especialidad, cursoActual } = req.query;

  // Seleccionar un curso aleatorio de la misma especialidad que no sea el curso actual
  const sql = `
    SELECT * FROM cursos 
    WHERE especialidad = ? AND nombre != ? 
    ORDER BY RAND() 
    LIMIT 1
  `;

  DB.query(sql, [especialidad, cursoActual], (err, result) => {
    if (err) {
      console.error('Error al obtener la recomendación:', err);
      return res.status(500).json({ message: 'Error al obtener la recomendación' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No se encontró recomendación.' });
    }

    res.json(result[0]); // Devolver el primer curso recomendado
  });
});


app.get('/api/evaluacion/:evaluacionId', (req, res) => {
  const evaluacionId = req.params.evaluacionId;

  const sql = `
    SELECT e.*, c.nombre AS cursoNombre 
    FROM evaluaciones e 
    JOIN cursos c ON e.curso_id = c.id 
    WHERE e.id = ?
  `;

  DB.query(sql, [evaluacionId], (err, result) => {
    if (err) {
      console.error('Error al obtener la evaluación:', err);
      return res.status(500).json({ message: 'Error al obtener la evaluación' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }

    res.json(result[0]);
  });
});


// Endpoint para obtener las evaluaciones de un curso específico
app.get('/api/courses/:cursoId/evaluaciones', (req, res) => {
  const { cursoId } = req.params;

  const query = `
    SELECT e.id, e.nota, c.ncurso AS curso, u.nombre AS estudiante
    FROM evaluaciones e
    JOIN cursos c ON e.idcurso = c.idcurso
    JOIN usuarios u ON e.idusuario = u.idusuario
    WHERE e.idcurso = ?
  `;

  db.query(query, [cursoId], (err, results) => {
    if (err) {
      console.error('Error al obtener evaluaciones:', err);
      return res.status(500).json({ error: 'Error al obtener las evaluaciones' });
    }
    res.json(results);
  });
});

// Endpoint para obtener las evaluaciones de un curso específico
app.get('/api/courses/:cursoId/evaluaciones', (req, res) => {
  const { cursoId } = req.params;

  const query = `
    SELECT e.id, e.nota, c.ncurso AS curso, u.nombre AS estudiante
    FROM evaluaciones e
    JOIN cursos c ON e.idcurso = c.idcurso
    JOIN usuarios u ON e.idusuario = u.idusuario
    WHERE e.idcurso = ?
  `;

  db.query(query, [cursoId], (err, results) => {
    if (err) {
      console.error('Error al obtener evaluaciones:', err);
      return res.status(500).json({ error: 'Error al obtener las evaluaciones' });
    }
    res.json(results);
  });
});

// Ruta para obtener todas las evaluaciones de un usuario
app.get('/api/usuarios/:usuarioId/evaluaciones', (req, res) => {
  const { usuarioId } = req.params;

  const query = `
    SELECT e.id, c.nombre AS curso, c.especialidad, e.nota_matematicas, e.nota_lenguaje, e.nota_historia, e.fecha
    FROM evaluaciones e
    JOIN cursos c ON e.curso_id = c.id
    WHERE e.usuario_id = ?
  `;

  DB.query(query, [usuarioId], (err, results) => {
    if (err) {
      console.error('Error al obtener las evaluaciones:', err);
      return res.status(500).json({ error: 'Error al obtener las evaluaciones' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones para este usuario.' });
    }

    res.json(results);
  });
});

app.get('/api/examen/:cursoId', (req, res) => {
  const cursoId = req.params.cursoId;

  const sql = 'SELECT * FROM preguntas WHERE curso_id = ?';

  DB.query(sql, [cursoId], (err, result) => {
    if (err) {
      console.error('Error al obtener las preguntas:', err);
      return res.status(500).json({ message: 'Error al obtener las preguntas del examen' });
    }

    const preguntasFormateadas = result.map(pregunta => ({
      id: pregunta.id,
      pregunta: pregunta.pregunta,
      especialidad: pregunta.especialidad,
      opciones: [pregunta.opcion1, pregunta.opcion2, pregunta.opcion3, pregunta.opcion4],
      respuestaCorrecta: pregunta.respuesta_correcta
    }));

    res.json({ preguntas: preguntasFormateadas });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});