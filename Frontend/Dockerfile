# Etapa 1: Construcción de la aplicación React con Vite
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente y construir
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx para producción
FROM nginx:alpine

# Copiar los artefactos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
