from typing import List
from datetime import date
import asyncpg
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from firebase_admin import auth
from fastapi import HTTPException, Depends, Request

from models import ExamSubmission, Question, Estudiante, User
from database import get_database_connection
from firebase import get_firebase_app
from firebase_admin.auth import InvalidIdTokenError


# Database connection
conn = get_database_connection()


# Firebase Admin SDK
firebase_app = get_firebase_app()


# Assuming you have a function to get the current user's email from Firebase token
def get_current_user_email(authorization: str) -> str:
    try:
        id_token = authorization.split(" ")[1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['email']
    except (IndexError, InvalidIdTokenError):
        raise HTTPException(status_code=401, detail="Invalid ID token")
    
async def get_courses_with_teacher_name() -> List[dict]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT c.idcurso, c.ncurso, c.descripcion, u.nombre AS nombre_docente
            FROM cursos c
            JOIN usuario u ON c.iddocente = u.idusuario
        """)
        courses = cur.fetchall()
        cur.close()
        return courses
    except Exception as e:
        logging.error(f"Error fetching courses with teacher's name: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching courses with teacher's name: {str(e)}")

async def get_courses_by_especialidad(idespecialidad: int):
    try:
        conn = await get_database_connection()  # Assuming you have a function to get asyncpg connection
        async with conn.transaction():
            query = """
                SELECT idcurso, idespecialidad, ncurso, descripcion, iddocente
                FROM cursos
                WHERE idespecialidad = $1
            """
            courses = await conn.fetch(query, idespecialidad)
            return [dict(course) for course in courses]  # Convert asyncpg Record objects to dictionaries
    except asyncpg.PostgresError as e:
        logging.error(f"PostgreSQL error fetching courses: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error fetching courses: {str(e)}")
        raise
    
# Utility function to fetch all questions from database
async def get_questions() -> List[dict]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM preguntas")
        questions = cur.fetchall()
        cur.close()
        return questions
    except Exception as e:
        logging.error(f"Error fetching questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")


# Utility function to fetch all especialidades from database
async def get_especialidades() -> List[dict]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM especialidad")
        especialidades = cur.fetchall()
        cur.close()
        return especialidades
    except Exception as e:
        logging.error(f"Error fetching especialidades: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching especialidades: {str(e)}")

async def get_exam_results(user_id: int) -> List[Estudiante]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT idusuario, fecha, idespecialidad1, nota1, idespecialidad2, nota2, idespecialidad3, nota3
            FROM estudiante
            WHERE idusuario = %s
        """, (user_id,))
        results = cur.fetchall()
        cur.close()

        estudiantes = []
        for result in results:
            estudiante = Estudiante(
                idusuario=result['idusuario'],
                fecha=result['fecha'],
                idespecialidad1=result['idespecialidad1'],
                nota1=result['nota1'],
                idespecialidad2=result['idespecialidad2'],
                nota2=result['nota2'],
                idespecialidad3=result['idespecialidad3'],
                nota3=result['nota3']
            )
            estudiantes.append(estudiante)

        return estudiantes

    except Exception as e:
        logging.error(f"Error fetching exam results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching exam results: {str(e)}")

# Utility function to fetch previous results from database
async def get_previous_results(user_id: int) -> List[Estudiante]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM estudiante WHERE idusuario = %s ORDER BY fecha DESC", (user_id,))
        results = cur.fetchall()
        cur.close()
        return results
    except Exception as e:
        logging.error(f"Error fetching previous results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching previous results: {str(e)}")

async def clear_previous_results(user_id: int):
    try:
        # Assuming you have a function to get a database connection
        conn = await get_database_connection()
        async with conn.transaction():
            # Execute the SQL query to delete previous results for the given user ID
            await conn.execute('''
                DELETE FROM Estudiante
                WHERE idusuario = $1
            ''', user_id)
        logging.info(f"Previous results cleared for user ID: {user_id}")
    except asyncpg.PostgresError as e:
        logging.error(f"Database error clearing previous results: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
    except Exception as e:
        logging.error(f"Error clearing previous results: {str(e)}")
        raise Exception(f"Error clearing previous results: {str(e)}")
    
# Utility function to fetch all user types from database
async def get_user_types() -> List[dict]:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT idtipousuario, tipousuario FROM tipousuario")
        user_types = cur.fetchall()
        cur.close()
        return user_types
    except Exception as e:
        logging.error(f"Error fetching user types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user types: {str(e)}")

async def get_user_id(email: str) -> int:
    try:
        conn = get_database_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT idusuario FROM usuario WHERE correo = %s", (email,))
        result = cur.fetchone()
        cur.close()
        if result:
            return result['idusuario']
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logging.error(f"Error fetching user ID: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user ID: {str(e)}")

    
# Utility function to save exam results to database
async def save_exam_results(estudiante: Estudiante):
    try:
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO estudiante (idusuario, fecha, idespecialidad1, nota1, idespecialidad2, nota2, idespecialidad3, nota3)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (estudiante.idusuario, estudiante.fecha,
             estudiante.idespecialidad1, estudiante.nota1, estudiante.idespecialidad2,
             estudiante.nota2, estudiante.idespecialidad3, estudiante.nota3)
        )

        conn.commit()
        cur.close()

    except Exception as e:
        logging.error(f"Error guardando resultados del examen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error guardando resultados del examen: {str(e)}")


# Utility function to calculate scores based on exam submission
async def calculate_scores(answers: ExamSubmission) -> dict:
    try:
        scores = {}
        cur = conn.cursor(cursor_factory=RealDictCursor)

        for question_id, answer in answers.items():
            cur.execute("SELECT idespecialidad, respuesta_correcta FROM preguntas WHERE idpregunta = %s", (int(question_id),))
            question = cur.fetchone()
            print("Question fetched from database:", question) 
            if not question:
                raise HTTPException(status_code=404, detail=f"Question with id {question_id} not found.")

            idespecialidad = question['idespecialidad']
            respuesta_correcta = question['respuesta_correcta']

            if idespecialidad not in scores:
                scores[idespecialidad] = {"correct": 0, "total": 0}

            scores[idespecialidad]["total"] += 1
            if answer == respuesta_correcta:
                scores[idespecialidad]["correct"] += 1

        scaled_scores = {}
        for especialidad, score_info in scores.items():
            if score_info["total"] > 0:
                percentage_correct = score_info["correct"] / score_info["total"]
                scaled_score = round(percentage_correct * 20, 2)
            else:
                scaled_score = 0.0
            scaled_scores[especialidad] = scaled_score

        return scaled_scores

    except Exception as e:
        logging.error(f"Error calculating scores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating scores: {str(e)}")


# Utility function to register a new user
async def register_user(user: User) -> dict:
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """
            INSERT INTO usuario (tipousuario_id, nombre, apellido_paterno, apellido_materno, dni, correo, contrasena)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING idusuario
            """,
            (user.idtipousuario, user.nombre, user.apellido_paterno, user.apellido_materno, user.dni, user.correo, user.contrasena)
        )

        user_id = cur.fetchone()['idusuario']
        conn.commit()
        cur.close()

        return {"message": "User registered successfully", "user_id": user_id}

    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")


# Utility function to authenticate and verify Firebase ID token
async def verify_firebase_token(id_token: str) -> dict:
    try:
        user = auth.verify_id_token(id_token)
        return user
    except Exception as e:
        logging.error(f"Firebase auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

# Utility function to close database connection
def close_database_connection():
    try:
        conn.close()
    except Exception as e:
        logging.error(f"Error closing database connection: {str(e)}")
