# Proyecto: Workflow AI (Asistente de Tareas)

Este es un proyecto Full-Stack construido para demostrar habilidades en
FastAPI, Next.js, Docker, IA (Gemini) y n8n.

## Stack Tecnológico

* **Backend:** Python, FastAPI, SQLModel
* **Frontend:** React, Next.js, TypeScript, Tailwind CSS
* **Base de Datos:** SQLite (manejada con SQLModel)
* **IA:** Google Gemini API
* **Automatización:** n8n
* **Contenerización:** Docker y Docker Compose

## 🚀 Cómo Ejecutar el Proyecto

Este proyecto está 100% dockerizado.

### Prerrequisitos

1.  Tener [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.
2.  Clonar este repositorio.

### Configuración

1.  **Obtener una API Key de Gemini:**
    Ve a [Google AI Studio](https://aistudio.google.com/app/apikey) y
    genera una nueva clave de API.

2.  **Crear el archivo de entorno del backend:**
    En la carpeta `backend/`, crea un archivo llamado `.env`
    y añade tu clave:

    ```
    # en backend/.env
    GEMINI_API_KEY=AQUI_VA_TU_API_KEY
    ```

### ¡Ejecutar!

Desde la carpeta raíz del proyecto, ejecuta un solo comando:

```bash
docker-compose up --build

### La primera vez puede tardar varios minutos mientras construye las imágenes.