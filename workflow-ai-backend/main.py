#importaciones necesarias
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List

import os
import google.generativeai as genai
from dotenv import load_dotenv
#from google import genai

import httpx

#from contextlib import asynccontextmanager


# ---- MODELO DE DATOS ----
# (En Angular, esto sería como crear una 'interface Task')
# SQLModel permite definir el modelo de la API y
# el modelo de la Base de Datos en un solo lugar.

class Task(SQLModel, table=True):
    # 'id' Llave Primaria (Primary Key)
    # 'Optional[int]' significa que puede ser int o None.
    # 'default=None' y 'primary_key=True' le dicen a la DB
    # que debe auto-generar este número (autoincrement).
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 'title' es un string simple.
    title: str
    # 'description' es un string que puede ser Nulo (None).
    description: Optional[str] = Field(default=None)
    ai_summary: Optional[str] = Field(default=None)

# NUEVO MODELO PARA ACTUALIZACIONES
# Este modelo NO es una tabla de DB (no tiene table=True).
# Es solo para validar los datos que entran por la API.
# Todos los campos son Opcionales (pueden ser None).
class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None




    # ---- CONFIGURACIÓN DE LA BASE DE DATOS ----

# 1. Aqui se define el nombre del archivo de la base de datos SQLite.
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# 2. se crea el "motor" (engine) de la base de datos.
# 'connect_args' es necesario solo para SQLite para permitir
# que sea usada por múltiples "hilos" (threads) a la vez.
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


# 3. Función para crear las tablas
# Esta función le dice a SQLModel que revise todos los modelos
# que heredan de 'SQLModel' (como la clase 'Task')
# y cree las tablas en la base de datos si no existen.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# ---- INICIO DE LA APLICACIÓN FASTAPI ----

# 4. aqui se crea la instancia de la app
app = FastAPI()

# Carga variables de entorno (busca un archivo .env)
load_dotenv()

try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("WARNING: GEMINI_API_KEY not found. AI analysis will fail.")

model = genai.GenerativeModel('gemini-2.5-flash')

# ---- CONFIGURACIÓN DE CORS ----
# Lista de orígenes (dominios) que tienen permiso
# para conectarse a nuestro backend.
origins = [
    "http://localhost:3000", # El origen de nuestro frontend de Next.js
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"], # Permitir todos los headers
)


# 5. Evento "startup" (Inicio)
# Esto es un "evento de ciclo de vida" de FastAPI.
# La función que decoremos con '@app.on_event("startup")'
# se ejecutará UNA SOLA VEZ, justo cuando la app inicia.
# (Equivalente a un 'ngOnInit' pero para toda la app).

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

#nueva forma
#@asynccontextmanager
#async def lifespan(app: FastAPI):
#    create_db_and_tables()

#app = FastAPI(lifespan=lifespan)


# ---- INYECCIÓN DE DEPENDENCIAS (Concepto Clave) ----

# (En Angular, esto es similar a inyectar un 'Service' 
# en el constructor de un Componente).

# Esta función nos dará una "Sesión" de Base de Datos
# para cada petición que la necesite.
# 'yield' es una palabra clave de Python para "generadores".
# En resumen:
# 1. Abre una sesión con 'with Session(engine) as session:'.
# 2. 'yield session' -> Entrega la sesión a nuestro endpoint.
# 3. (El endpoint usa la sesión...)
# 4. El 'with' se asegura de que la sesión se cierre
#    correctamente, incluso si hay un error.
def get_session():
    with Session(engine) as session:
        yield session

# ---- ENDPOINTS ----

@app.get("/")
def read_root():
    return {"message": "¡Hola desde FastAPI con Base de Datos SQLite!"}


# Ruta para CREAR una nueva Tarea
# @app.post("/tasks/") le dice a FastAPI que esta función
# maneja peticiones POST a la ruta '/tasks/'.

# 1. 'task: Task': FastAPI automáticamente tomará el JSON
#    del "body" de la petición y lo validará. Si coincide
#    con el modelo de 'Task', lo convertirá en un objeto 'Task'.
#    ¡Si no coincide, regresará un error 422 automáticamente!

# 2. 'db: Session = Depends(get_session)': Esta es la
#    Inyección de Dependencias. FastAPI ejecutará 'get_session()'
#    y pondrá el resultado (la sesión de DB) en la variable 'db'.

@app.post("/tasks/")
def create_task(task: Task, db: Session = Depends(get_session)):
    # 1. Añadimos el objeto 'task' a la sesión de la DB.
    db.add(task)
    # 2. "Confirmamos" (commit) los cambios para guardarlos en la DB.
    db.commit()
    # 3. Refrescamos el objeto 'task' para que obtenga
    #    los datos nuevos de la DB (como el 'id' auto-generado).
    db.refresh(task)
    # 4. Regresamos la tarea creada.
    return task

@app.get("/tasks/")
def get_tasks(db: Session = Depends(get_session)) -> List[Task]:
    # 1. crear una "declaración" (statement) de SQL
    #    diciendo: "Selecciona todo de la tabla Task".
    statement = select(Task)

    # 2. se ejecuta la declaración en la sesión de la DB.
    results = db.exec(statement)

    # 3. 'results' es un iterador, '.all()' lo convierte
    #    en una lista de objetos 'Task'.
    tasks = results.all()

    # 4. Se hace el return para que FastAPI los convertirá a JSON.
    return tasks

# Ruta para LEER UNA Tarea por su ID
# '{task_id}' se llama "Parámetro de Ruta" (Path Parameter).
# FastAPI es inteligente: ve que la función espera
# 'task_id: int' y automáticamente convertirá
# el valor de la URL en un número entero.

@app.get("/tasks/{task_id}")
def read_task(task_id: int, db: Session = Depends(get_session)) -> Task:
    # 1. 'db.get()' es la forma más directa de buscar
    #    un objeto por su Llave Primaria (ID).
    task = db.get(Task, task_id)

    # 2. Si la tarea no existe (es None),
    #    se lanza (raise) una excepción HTTP 404.
    if not task:
        raise HTTPException(status_code=404, detail="Task not found!")
    
    # si se encuentra la tarea se hace el return de la misma
    return task


# endpoint para ACTUALIZAR UNA Tarea (PATCH)
# 1. Recibe el 'task_id' de la URL.
# 2. Recibe los datos a actualizar ('task_update') del body.
#    FastAPI usará el modelo 'TaskUpdate' para validar.

@app.patch("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_session)) -> Task:

    # 1. Busca la tarea en la DB (igual que en GET by ID)
    task = db.get(Task, task_id)

    # 2. Si no existe, lanza error 404
    if not task:
        raise HTTPException(status_code=404, detail="Task not found!")
    
    # 3. Obtiene los datos del 'task_update' que Si fueron enviados
    #    (excluyendo los que son 'None').
    update_data = task_update.model_dump(exclude_unset=True)

    # 4. Itera sobre los datos enviados y actualiza
    #    el objeto 'task' que encontramos en la DB.
    for key, value in update_data.items():
        setattr(task, key, value)
    
    # 5. Guarda los cambios en la DB
    db.add(task)
    db.commit()
    db.refresh(task)

    #regreso la tarea actualizada
    return task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_session)):

    # 1. Busca la tarea en la DB
    task = db.get(Task, task_id)

    ## 2. Si no existe, lanza 404
    if not task:
        raise HTTPException(status_code=404, detail="Task not found!")
    
    # 3. Si se encuentra, se elimina de la sesión
    db.delete(task)

    # 4. Confirma (commit) la eliminación en la DB
    db.commit()

    # aqui se llama al webhook de n8n
    try:
        webhook_url = "http://n8n:5678/webhook-test/be2a8c65-fb0c-4215-84ec-1d8233d982fb"

        #se en via el payload ( datos a n8n )
        httpx.post(webhook_url, json = {
            "message": f"Task was deleted: '{ task.title }'",
            "deleted_id": task_id
        })
    except Exception as e:
        #si n8n falla hacemos que se imprima el error en el log del backend
        #para que la app no se rompa
        print(f"WARNING: connection to n8n failed. {e}")

    # 5. return con una confirmación simple.
    # (Para un DELETE, no es necesario regresar el objeto)
    return {"Task successfully deleted!": True}

@app.post("/tasks/{task_id}/analyze")
def analyze_task(task_id: int, db: Session = Depends(get_session)) -> Task:

    # 1. Busca la tarea
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Se asegura de que hay algo que analizar
    if not task.description:
        raise HTTPException(status_code=400, detail="Task has no description to analyze")

    # 3. Prepara el Prompt para la IA
    prompt = f"""
    Analiza la siguiente descripción de una tarea y genera un resumen
    de una sola línea, con un tono profesional y accionable.

    Descripción: "{task.description}"

    Resumen de una línea:
    """

    try:
        # 4. Llama a la API de Gemini
        response = model.generate_content(prompt)

        # 5. Guarda el resultado
        task.ai_summary = response.text.strip()

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    except Exception as e:
        print(f"IA API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze task with AI")