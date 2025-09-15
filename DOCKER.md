# 🐳 Docker Setup Guide

Este documento explica cómo ejecutar la aplicación Social Content AI Generator usando Docker.

## 📋 Prerrequisitos

- Docker Desktop instalado y ejecutándose
- Docker Compose instalado
- API Key de Gemini AI

## 🚀 Ejecución Rápida

### 1. Configurar Variables de Entorno

```bash
# Opción 1: Exportar variable de entorno
export GEMINI_API_KEY=tu-api-key-de-gemini

# Opción 2: Crear archivo .env
echo "GEMINI_API_KEY=tu-api-key-de-gemini" > .env
```

### 2. Ejecutar con Script Automático

```bash
./build.sh
```

### 3. Ejecutar Manualmente

```bash
# Construir imágenes
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🔧 Configuraciones Disponibles

### Producción
```bash
docker-compose up -d
```
- Frontend: http://localhost
- Backend: http://localhost:3001

### Desarrollo
```bash
docker-compose -f docker-compose.dev.yml up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📊 Comandos Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Reconstruir y reiniciar
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver estado de los servicios
docker-compose ps

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend npm run build
docker-compose exec frontend npm run build
```

## 🔍 Troubleshooting

### Puerto 80 ocupado
Si el puerto 80 está ocupado, modifica el `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Cambia 80 por 8080
```

### Error de permisos
```bash
sudo chmod +x build.sh
```

### Limpiar Docker
```bash
# Eliminar contenedores no utilizados
docker container prune

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar todo (¡cuidado!)
docker system prune -a
```

## 🏗️ Estructura de Archivos Docker

```
├── Dockerfile              # Frontend production
├── Dockerfile.dev          # Frontend development
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
├── nginx.conf             # Nginx configuration
├── build.sh               # Build script
├── .dockerignore          # Files to ignore
└── backend/
    ├── Dockerfile         # Backend production
    ├── Dockerfile.dev     # Backend development
    └── .dockerignore      # Backend ignore files
```

## 🔒 Seguridad

- Las variables de entorno sensibles deben configurarse en producción
- El JWT_SECRET debe ser cambiado en producción
- Los puertos expuestos deben ser configurados según el entorno
- Las imágenes usan Alpine Linux para reducir el tamaño y superficie de ataque

## 📈 Monitoreo

### Health Checks
- Backend: http://localhost:3001/health
- Frontend: http://localhost (proxy al backend)

### Logs
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de errores
docker-compose logs --tail=100 | grep ERROR
```

## 🚀 Próximos Pasos

1. **Base de Datos**: Agregar PostgreSQL con persistencia
2. **Redis**: Agregar cache para mejorar performance
3. **Monitoring**: Integrar Prometheus y Grafana
4. **CI/CD**: Configurar GitHub Actions para deployment automático
