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
app.post('/api/login', (req, res) => {
  const { correo, contrasena } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?';
  DB.query(sql, [correo, contrasena], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];

    // Opcional: Generar un token JWT para la autenticación
    const token = jwt.sign({ userId: user.id, correo: user.correo }, 'your_jwt_secret', {
      expiresIn: '1h', // El token expira en 1 hora
    });

    // Devolver los datos del usuario y el token
    res.json({ 
      message: 'Inicio de sesión exitoso', 
      user: { 
        id: user.id, 
        nombre: user.nombre, 
        correo: user.correo 
      }, 
      token 
    });
  });
});

// Ruta para crear un nuevo usuario
app.post('/api/registro', (req, res) => {
  const { tipousuario, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena } = req.body;

  const sql = 'INSERT INTO usuarios (tipousuario, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [tipousuario, nombre, apellido_paterno, apellido_materno || null, dni, correo, contrasena];

  DB.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar el usuario:', err);
      return res.status(500).json({ message: 'Error al crear el usuario' });
    }
    res.json({ message: 'Usuario registrado con éxito', userId: result.insertId });
  });
});

// Ruta para crear un curso
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
  
  // Consulta SQL para obtener el curso por su ID
  const sql = 'SELECT * FROM cursos WHERE id = ?';
  
  DB.query(sql, [cursoId], (err, result) => {
    if (err) {
      console.error('Error al obtener el curso:', err);
      return res.status(500).json({ message: 'Error al obtener el curso' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.json(result[0]); // Devolver el primer resultado (el curso)
  });
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
  const { cursoId, respuestas, fecha } = req.body;

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
    const sqlInsert = 'INSERT INTO evaluaciones (curso_id, fecha, nota_matematicas, nota_lenguaje, nota_historia) VALUES (?, ?, ?, ?, ?)';
    DB.query(sqlInsert, [cursoId, fecha, notaMatematicas, notaLenguaje, notaHistoria], (err, result) => {
      if (err) {
        console.error('Error al guardar la evaluación:', err);
        return res.status(500).json({ message: 'Error al guardar la evaluación' });
      }

      res.json({ evaluacionId: result.insertId });
    });
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


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});