import React, { useEffect, useState } from 'react';
import './Grades.css';

function Grades() {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const storedGrades = JSON.parse(localStorage.getItem('grades')) || [];
    setGrades(storedGrades);
  }, []);

  return (
    <div className="grades-container">
      <h2>Notas</h2>
      <ul>
        {grades.map((grade, index) => (
          <li key={index}>
            <span>Fecha: {new Date(grade.date).toLocaleDateString()}</span>
            <span>Puntuación: {grade.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Grades;
