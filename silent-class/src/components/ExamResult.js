import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './ExamResult.css';

function ExamResult() {
  const navigate = useNavigate();
  const [examResults, setExamResults] = useState([]);
  const [especialidades, setEspecialidades] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch especialidades on component mount
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await fetch('http://localhost:8000/especialidades');
        if (!response.ok) {
          throw new Error('Failed to fetch especialidades');
        }
        const data = await response.json();
        const especialidadesMap = {};
        data.forEach(especialidad => {
          especialidadesMap[especialidad.idespecialidad] = especialidad.especialidad;
        });
        setEspecialidades(especialidadesMap);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching especialidades:', error);
        setLoading(false);
      }
    };

    fetchEspecialidades();
  }, []);

  // Fetch exam results and courses on authentication state change
  useEffect(() => {
    const fetchExamResults = async (user) => {
      try {
        const idToken = await getAuth().currentUser.getIdToken();
        const response = await fetch('http://localhost:8000/exam-results', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch exam results');
        }

        const data = await response.json();
        console.log("Fetched exam results:", data); // Debugging line
        setExamResults(data);
        fetchCoursesForEspecialidades(data); // Fetch courses for exam results
      } catch (error) {
        console.error('Error fetching exam results:', error);
      }
    };

    const unregisterAuthObserver = onAuthStateChanged(getAuth(), user => {
      if (!user) {
        // Redirect to login if no user is signed in
        navigate('/login');
      } else {
        // Fetch exam results
        fetchExamResults(user);
      }
    });

    return () => unregisterAuthObserver(); // Clean up Firebase observer
  }, [navigate]);

  // Fetch courses for each idespecialidad in examResults
  const fetchCoursesForEspecialidades = useCallback(async (examResults) => {
    try {
      const idespecialidades = examResults.map(result => result.idespecialidad1);
      const coursesPromises = idespecialidades.map(idespecialidad => {
        return fetch(`http://localhost:8000/courses/${idespecialidad}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch courses for idespecialidad ${idespecialidad}`);
          }
          return response.json();
        });
      });

      Promise.all(coursesPromises)
        .then(coursesData => {
          const courses = coursesData.flat(); // Flatten courses array
          console.log("Fetched courses:", courses); // Debugging line
          setCourses(courses);
        })
        .catch(error => {
          console.error('Error fetching courses:', error);
        });
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, []);

  return (
    <div className="exam-result-container">
      <h2>Resultados</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {examResults.length === 0 ? (
            <p>No current results available.</p>
          ) : (
            <>
              <ul>
                {examResults.map((result, index) => (
                  <li key={index} className="exam-result-item">
                    <span className="result-especialidad">{result.fecha} </span>
                    <span className="result-especialidad">{especialidades[result.idespecialidad1]}</span>
                    <span className="result-score">: {typeof result.nota1 === 'number' ? result.nota1.toFixed(2) : 'N/A'}</span>
                    <span className="result-especialidad"> {especialidades[result.idespecialidad2]}</span>
                    <span className="result-score">: {typeof result.nota2 === 'number' ? result.nota2.toFixed(2) : 'N/A'}</span>
                    <span className="result-especialidad"> {especialidades[result.idespecialidad3]}</span>
                    <span className="result-score">: {typeof result.nota3 === 'number' ? result.nota3.toFixed(2) : 'N/A'}</span>
                  </li>
                ))}
              </ul>

              <h2>Cursos relacionados</h2>
              <ul>
                {courses.map((course, index) => (
                  <li key={index} className="course-item">
                    <span className="course-ncurso">{course.ncurso}</span>
                    <span className="course-descripcion">{course.descripcion}</span>
                    <span className="course-docente">{course.nombre_docente}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ExamResult;
