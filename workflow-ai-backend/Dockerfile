# 1. Imagen Base: Empezamos desde una "caja" oficial que ya tiene Python
FROM python:3.14-slim

# 2. Directorio de Trabajo: Le dice a Docker que todo lo que hagamos
#    a partir de ahora, lo haga dentro de la carpeta '/app' en el contenedor.
WORKDIR /app

# 3. Copiar la "lista de compras" (requirements): Copiamos nuestro requirements.txt
#    desde nuestra máquina (host) a la carpeta '/app' del contenedor.
COPY requirements.txt .

# 4. Instalar Dependencias: Ejecuta 'pip install' DENTRO del contenedor.
#    '--no-cache-dir' es una buena práctica para que la "caja" sea más ligera.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copiar el Código: Copiamos todo lo demás de nuestra carpeta 'backend'
#    (main.py, database.db, etc.) a la carpeta '/app' del contenedor.
COPY . .

# 6. El Comando de Arranque: Le dice a Docker qué comando ejecutar
#    cuando la "caja" se inicie.
#    '--host 0.0.0.0' es crucial para que FastAPI sea accesible
#    desde fuera del contenedor.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]