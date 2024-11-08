from pydantic import BaseModel
from datetime import date
from typing import Optional

class Question(BaseModel):
    idpregunta: int
    idespecialidad: int
    idnivel: int
    pregunta: str
    opcion_a: str
    opcion_b: str
    opcion_c: str
    opcion_d: str
    respuesta_correcta: str

class Especialidad(BaseModel):
    idespecialidad: int
    especialidad: str

class User(BaseModel):
    idtipousuario: int
    nombre: str
    apellido_paterno: str
    apellido_materno: str
    dni: int
    correo: str
    contrasena: str

class Estudiante(BaseModel):
    idusuario: int
    fecha: date
    idespecialidad1: int
    nota1: float
    idespecialidad2: int
    nota2: float
    idespecialidad3: int
    nota3: float

class Course(BaseModel):
    idcurso: int
    idespecialidad: int
    ncurso: str
    descripcion: str
    iddocente: int

class ExamSubmission(BaseModel):
    answers: dict
