# Dockerfile - multi-stage build

# ==================== STAGE 1: Build ====================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# ==================== STAGE 2: Production ====================
FROM node:22-alpine AS production

WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodeapp

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código desde builder
COPY --from=builder --chown=nodeapp:nodejs /app/src ./src

# Crear carpeta de uploads
RUN mkdir -p uploads && chown nodeapp:nodejs uploads

# Cambiar a usuario no-root
USER nodeapp

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["npm", "start"]
