#!/bin/bash

echo "🚀 Iniciando despliegue con Docker Compose..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Instalando..."
    sudo apt update
    sudo apt install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Instalando..."
    sudo apt install -y docker-compose
fi

log "Deteniendo contenedores existentes..."
docker-compose -f docker-compose.deploy.yml down

log "Limpiando imágenes no utilizadas..."
docker system prune -f

log "Construyendo imágenes..."
docker-compose -f docker-compose.deploy.yml build --no-cache

log "Iniciando servicios..."
docker-compose -f docker-compose.deploy.yml up -d

log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "Verificando estado de los servicios..."
docker-compose -f docker-compose.deploy.yml ps

# Verificar logs
log "Verificando logs del backend..."
docker-compose -f docker-compose.deploy.yml logs backend --tail=20

log "Verificando logs de MySQL..."
docker-compose -f docker-compose.deploy.yml logs mysql --tail=10

# Verificar conectividad
log "Verificando conectividad..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success "Backend está funcionando correctamente"
else
    warning "Backend no responde en el puerto 3001"
fi

if curl -f http://localhost:80 > /dev/null 2>&1; then
    success "Frontend está funcionando correctamente"
else
    warning "Frontend no responde en el puerto 80"
fi

success "Despliegue completado!"
log "Servicios disponibles en:"
log "- Frontend: http://$(curl -s ifconfig.me):80"
log "- Backend API: http://$(curl -s ifconfig.me):3001"
log "- MySQL: localhost:3306"

echo ""
log "Para ver logs en tiempo real:"
log "docker-compose -f docker-compose.deploy.yml logs -f"
