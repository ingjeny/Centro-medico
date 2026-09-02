# Imagen base ligera con soporte completo de glibc para librerías nativas (sharp)
FROM node:20-bookworm-slim

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código del backend
COPY . .

# Crear directorios de uploads si no existen
RUN mkdir -p uploads/firmas uploads/logo

EXPOSE 3000

CMD ["npm", "start"]
