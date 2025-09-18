#!/bin/bash

# Script de despliegue automatizado para producción
# Este script maneja el despliegue completo de la aplicación

set -e

# Configuración
PROJECT_NAME="social-content-ai-generator"
BACKUP_DIR="/opt/social-content-ai/backups"
LOG_DIR="/opt/social-content-ai/logs"
APP_DIR="/opt/social-content-ai/app"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging con colores
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Función para verificar prerrequisitos
check_prerequisites() {
    log "Verificando prerrequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    # Verificar archivo de configuración
    if [ ! -f ".env.production" ]; then
        log_error "Archivo .env.production no encontrado"
        log "Crear archivo .env.production basado en env.production.example"
        exit 1
    fi
    
    log_success "Prerrequisitos verificados"
}

# Función para crear directorios necesarios
create_directories() {
    log "Creando directorios necesarios..."
    
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "$APP_DIR"
    
    # Establecer permisos
    sudo chown -R $USER:$USER "$BACKUP_DIR"
    sudo chown -R $USER:$USER "$LOG_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    
    log_success "Directorios creados"
}

# Función para hacer backup antes del despliegue
pre_deploy_backup() {
    log "Creando backup antes del despliegue..."
    
    if [ -f "scripts/backup-production.sh" ]; then
        ./scripts/backup-production.sh emergency
        log_success "Backup de emergencia creado"
    else
        log_warning "Script de backup no encontrado, continuando sin backup"
    fi
}

# Función para construir imágenes Docker
build_images() {
    log "Construyendo imágenes Docker..."
    
    # Construir imagen del backend
    log "Construyendo backend..."
    docker-compose -f docker-compose.prod.yml build backend
    
    # Construir imagen del frontend
    log "Construyendo frontend..."
    docker-compose -f docker-compose.prod.yml build frontend
    
    log_success "Imágenes Docker construidas"
}

# Función para ejecutar migraciones de base de datos
run_migrations() {
    log "Ejecutando migraciones de base de datos..."
    
    # Esperar a que la base de datos esté lista
    log "Esperando a que la base de datos esté lista..."
    sleep 30
    
    # Ejecutar migraciones
    docker-compose -f docker-compose.prod.yml exec backend npm run migrate
    
    log_success "Migraciones ejecutadas"
}

# Función para desplegar la aplicación
deploy_application() {
    log "Desplegando aplicación..."
    
    # Detener servicios existentes
    log "Deteniendo servicios existentes..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Iniciar servicios
    log "Iniciando servicios..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 60
    
    log_success "Aplicación desplegada"
}

# Función para verificar el despliegue
verify_deployment() {
    log "Verificando despliegue..."
    
    # Verificar que los contenedores estén corriendo
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log_success "Contenedores están corriendo"
    else
        log_error "Algunos contenedores no están corriendo"
        docker-compose -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Verificar conectividad del frontend
    if curl -f http://localhost:80 >/dev/null 2>&1; then
        log_success "Frontend accesible en puerto 80"
    else
        log_warning "Frontend no accesible en puerto 80"
    fi
    
    # Verificar conectividad del backend
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log_success "Backend accesible en puerto 3001"
    else
        log_warning "Backend no accesible en puerto 3001"
    fi
    
    # Verificar base de datos
    if docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost -u "${MYSQL_USER:-social_content_user}" -p"${MYSQL_PASSWORD:-social_content_password}" >/dev/null 2>&1; then
        log_success "Base de datos accesible"
    else
        log_warning "Base de datos no accesible"
    fi
}

# Función para mostrar logs
show_logs() {
    log "Mostrando logs de la aplicación..."
    docker-compose -f docker-compose.prod.yml logs --tail=50
}

# Función para mostrar estado de los servicios
show_status() {
    log "Estado de los servicios:"
    docker-compose -f docker-compose.prod.yml ps
}

# Función para limpiar recursos no utilizados
cleanup() {
    log "Limpiando recursos no utilizados..."
    
    # Eliminar imágenes huérfanas
    docker image prune -f
    
    # Eliminar contenedores detenidos
    docker container prune -f
    
    # Eliminar volúmenes no utilizados
    docker volume prune -f
    
    log_success "Limpieza completada"
}

# Función para rollback
rollback() {
    log "Ejecutando rollback..."
    
    # Detener servicios actuales
    docker-compose -f docker-compose.prod.yml down
    
    # Restaurar backup más reciente
    local latest_backup=$(ls -t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | head -n1)
    
    if [ -n "$latest_backup" ]; then
        log "Restaurando backup: $latest_backup"
        ./scripts/backup-production.sh restore "$latest_backup"
    else
        log_warning "No se encontró backup para restaurar"
    fi
    
    # Reiniciar servicios
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Rollback completado"
}

# Función para mostrar ayuda
show_help() {
    echo "Script de despliegue para Social Content AI Generator"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  deploy          - Despliegue completo (default)"
    echo "  build           - Solo construir imágenes"
    echo "  start           - Solo iniciar servicios"
    echo "  stop            - Detener servicios"
    echo "  restart         - Reiniciar servicios"
    echo "  status          - Mostrar estado de servicios"
    echo "  logs            - Mostrar logs"
    echo "  verify          - Verificar despliegue"
    echo "  cleanup         - Limpiar recursos no utilizados"
    echo "  rollback        - Hacer rollback a versión anterior"
    echo "  help            - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 deploy"
    echo "  $0 status"
    echo "  $0 logs"
}

# Función principal de despliegue
main_deploy() {
    log "=== INICIANDO DESPLIEGUE DE PRODUCCIÓN ==="
    
    check_prerequisites
    create_directories
    pre_deploy_backup
    build_images
    deploy_application
    run_migrations
    verify_deployment
    
    log_success "=== DESPLIEGUE COMPLETADO EXITOSAMENTE ==="
    log "La aplicación está disponible en: http://localhost:80"
    log "Backend API disponible en: http://localhost:3001"
}

# Main
case "${1:-deploy}" in
    "deploy")
        main_deploy
        ;;
    "build")
        check_prerequisites
        build_images
        ;;
    "start")
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    "stop")
        docker-compose -f docker-compose.prod.yml down
        ;;
    "restart")
        docker-compose -f docker-compose.prod.yml restart
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "verify")
        verify_deployment
        ;;
    "cleanup")
        cleanup
        ;;
    "rollback")
        rollback
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
