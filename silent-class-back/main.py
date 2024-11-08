from fastapi import FastAPI, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from datetime import date
from typing import List
import logging

from models import Question, Especialidad, User, Estudiante, ExamSubmission, Course
from utils import (
    get_current_user_email, get_questions, get_especialidades,get_courses_with_teacher_name, get_courses_by_especialidad, get_exam_results,
    get_previous_results, clear_previous_results, get_user_types, get_user_id,
    calculate_scores, save_exam_results, register_user,
    close_database_connection
)
from middlewares import setup_cors
from firebase import get_firebase_app

# FastAPI app
app = FastAPI()

# Firebase Admin SDK
firebase_app = get_firebase_app()

# Setup CORS
setup_cors(app)

# Logging configuration
logging.basicConfig(level=logging.INFO)


# Get questions
@app.get("/questions", response_model=List[Question])
async def read_questions():
    try:
        questions = await get_questions()
        return questions
    except Exception as e:
        logging.error(f"Error fetching questions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")


# Get especialidades
@app.get("/especialidades", response_model=List[Especialidad])
async def read_especialidades():
    try:
        especialidades = await get_especialidades()
        return especialidades
    except Exception as e:
        logging.error(f"Error fetching especialidades: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching especialidades: {str(e)}")

# Get courses with teacher's name
@app.get("/courses", response_model=List[dict])
async def read_courses():
    try:
        courses = await get_courses_with_teacher_name()
        return courses
    except Exception as e:
        logging.error(f"Error fetching courses: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")

# Get courses by especialidad
@app.get("/courses/{idespecialidad}", response_model=List[Course])
async def read_courses(idespecialidad: int):
    try:
        courses = await get_courses_by_especialidad(idespecialidad)
        return courses
    except Exception as e:
        logging.error(f"Error fetching courses for especialidad {idespecialidad}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching courses for especialidad {idespecialidad}: {str(e)}")
    
# Get user types
@app.get("/user-types", response_model=List[dict])
async def read_user_types():
    try:
        user_types = await get_user_types()
        return user_types
    except Exception as e:
        logging.error(f"Error fetching user types: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching user types: {str(e)}")

@app.get("/user-id")
async def read_user_id(request: Request):
    user_id = await get_user_id(request)
    return user_id

# Submit exam endpoint
@app.post("/submit-exam", response_model=dict)
async def submit_exam(exam_submission: ExamSubmission, authorization: str = Header(...)):
    try:
        # Get current user's email from the authorization token
        email = get_current_user_email(authorization)

        # Get user ID from email
        user_id = await get_user_id(email)
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")

        print("Received user answers:", exam_submission)  # Debugging line

        # Calculate scores
        scaled_scores = await calculate_scores(exam_submission.answers)

        # Save exam results to database
        today = date.today()
        scores_list = list(scaled_scores.items())
        if len(scores_list) != 3:
            raise HTTPException(status_code=400, detail="Invalid number of especialidades in exam submission")

        # Sort by especialidad ID
        scores_list.sort(key=lambda x: x[0])

        estudiante = Estudiante(
            idusuario=user_id,
            fecha=today,
            idespecialidad1=scores_list[0][0],
            nota1=scores_list[0][1],
            idespecialidad2=scores_list[1][0],
            nota2=scores_list[1][1],
            idespecialidad3=scores_list[2][0],
            nota3=scores_list[2][1],
        )
        await save_exam_results(estudiante)

        logging.info("Final scaled scores:", scaled_scores)
        print("Final scaled scores:", scaled_scores)
        return scaled_scores

    except HTTPException as e:
        logging.error(f"HTTP Error submitting exam: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error submitting exam: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error submitting exam: {str(e)}")
    
# Get exam results for current user
@app.get("/exam-results", response_model=List[Estudiante])
async def read_exam_results(authorization: str = Header(...)):
    try:
        # Get current user's email from the authorization token
        email = get_current_user_email(authorization)
        # Get user ID from email
        user_id = await get_user_id(email)
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")

        exam_results = await get_exam_results(user_id)
        return exam_results
    
    except HTTPException as e:
        logging.error(f"HTTP Error fetching exam results: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error fetching exam results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching exam results: {str(e)}")

# Get previous exam results for current user
@app.get("/previous-results", response_model=List[dict])
async def read_previous_results(authorization: str = Header(...)):
    try:
        # Get current user's email from the authorization token
        email = get_current_user_email(authorization)

        # Get user ID from email
        user_id = await get_user_id(email)
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")

        previous_results = await get_previous_results(user_id)
        return previous_results

    except HTTPException as e:
        logging.error(f"HTTP Error fetching previous results: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error fetching previous results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching previous results: {str(e)}")

# Clear previous exam results for current user
@app.post("/clear-previous-results", response_model=dict)
async def clear_previous_exam_results(authorization: str = Header(...)):
    try:
        # Get current user's email from the authorization token
        email = get_current_user_email(authorization)

        # Get user ID from email
        user_id = await get_user_id(email)
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found")

        await clear_previous_results(user_id)
        return {"detail": "Previous results cleared successfully"}

    except HTTPException as e:
        logging.error(f"HTTP Error clearing previous results: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Error clearing previous results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error clearing previous results: {str(e)}")


# Route to register user
@app.post("/signup", response_model=dict)
async def signup(user: User):
    try:
        response = await register_user(user)
        return response
    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error registering user: {str(e)}")


# Run app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, debug=True, log_level="info")


# Close database connection on shutdown
@app.on_event("shutdown")
def shutdown_event():
    close_database_connection()
