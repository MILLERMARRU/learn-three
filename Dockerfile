# ══ Etapa 1: compilar la app con Node ───────
FROM node:24-alpine AS build
WORKDIR /app

# dependencias primero para aprovechar la caché de capas
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ══ Etapa 2: servir los archivos estáticos con nginx ───────
FROM nginx:stable-alpine AS produccion
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/salud >/dev/null || exit 1
