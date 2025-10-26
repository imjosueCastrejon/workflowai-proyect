# --- ETAPA 1: Construcción (Build) ---
# se usa la imagen oficial de Node.js
# ponemos un "alias" (AS builder) para referirnos a ella después.
FROM node:22.16.0 AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el 'package.json' y 'package-lock.json'
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código fuente (src, public, next.config.js, etc.)
COPY . .

# Ejecuta el comando de "build" de Next.js
RUN npm run build


# --- ETAPA 2: Producción (Run) ---
# Comienza desde CERO con una imagen súper ligera
FROM node:22.16.0-alpine

WORKDIR /app

# Copia el 'package.json' para saber cómo correr la app
COPY package.json ./

# Copia los archivos de "build" de la etapa 'builder'
# 1. Copia la carpeta 'public'
COPY --from=builder /app/public ./public

# 2. Copia los archivos estáticos generados por el build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expone el puerto 3000 (el que usa Next.js)
EXPOSE 3000

# El comando para iniciar el servidor de Next.js en modo producción
CMD ["node", "server.js"]