# Dockerfile
# Etapa de construcción
FROM node:20-alpine as build-stage
WORKDIR /app

# Definimos el argumento para la URL de la API
ARG VITE_API_BASE_URL
# Lo pasamos como variable de entorno durante la construcción (build time)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]