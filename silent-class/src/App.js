import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Exam from './components/Exam';
import ExamResult from './components/ExamResult';
import Courses from './components/Courses';
import CrearCurso from './components/CrearCurso';
import CursoDetalle from './components/CursoDetalle'; // Importar la vista del curso
import Examen from './components/Examen'; // Importamos el componente Examen
import Evaluacion from './components/Evaluacion'; // Importamos Evaluacion
import Evaluaciones from './components/Evaluaciones';
import EditarCurso from './components/EditarCurso'; // Importar el componente de edición
import { AuthProvider } from './context/AuthContext'; // Importamos el AuthProvider
import Notas from './components/Notas';  // Importar la nueva vista Notas
import './App.css';

function App() {

  // Definir un usuarioId de prueba (1 por ejemplo) o obtenerlo de algún estado global o autenticación
  const usuarioId = 1;

  return (
    <AuthProvider> {/* Proveemos el contexto a toda la aplicación */}
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/exam-result" element={<ExamResult />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/crearcurso" element={<CrearCurso />} />
            <Route path="/curso/:id" element={<CursoDetalle />} /> {/* Nueva ruta para ver un curso específico */}
            <Route path="/evaluacion/:evaluacionId" element={<Evaluacion />} /> {/* Nueva ruta para la evaluación */}
            <Route path="/examen/:id" element={<Examen />} /> {/* Nueva ruta para realizar examen */}
            <Route path="/courses/:cursoId/evaluaciones" component={Evaluaciones} /> {/* Asociado con Evaluaciones */}
            <Route path="/courses" component={Courses} />
            <Route path="/editar-curso/:id" element={<EditarCurso />} /> {/* Ruta para editar curso */}
            <Route path="/mis-evaluaciones" element={<Notas />} />  {/* Ruta para ver las notas */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
