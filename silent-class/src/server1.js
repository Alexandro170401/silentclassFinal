const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;

// PostgreSQL pool
const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_username',
  password: 'your_password',
  port: 5432,
});

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to get exam questions
app.get('/api/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to submit answers and get recommendations
app.post('/api/submit', async (req, res) => {
  const answers = req.body.answers;

  // Calculate the grade based on answers
  // This is a placeholder for actual logic
  const grade = calculateGrade(answers);

  // Get course recommendations based on grade
  const courses = getCourseRecommendations(grade);

  res.json({ grade, courses });
});

const calculateGrade = (answers) => {
  // Implement your grading logic here
  let correctAnswers = 0;
  answers.forEach(answer => {
    // Example grading logic
    if (answer.correct) correctAnswers++;
  });
  return (correctAnswers / answers.length) * 100;
};

const getCourseRecommendations = (grade) => {
  // Implement your course recommendation logic here
  if (grade > 80) {
    return ['Advanced Course 1', 'Advanced Course 2'];
  } else if (grade > 50) {
    return ['Intermediate Course 1', 'Intermediate Course 2'];
  } else {
    return ['Beginner Course 1', 'Beginner Course 2'];
  }
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
