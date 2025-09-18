#!/bin/bash

# Script de despliegue simplificado
# IP: 18.191.51.184
# Archivo PEM: /Users/buentipo/Downloads/social_contentbt.pem

set -e

# Configuración del servidor
SERVER_IP="18.191.51.184"
PEM_FILE="/Users/buentipo/Downloads/social_contentbt.pem"
SERVER_USER="ubuntu"
APP_DIR="/opt/social-content-ai"

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

# Función para ejecutar comandos en el servidor
run_remote() {
    local cmd="$1"
    ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$cmd"
}

# Función para copiar archivos al servidor
copy_to_server() {
    local local_path="$1"
    local remote_path="$2"
    scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r "$local_path" "$SERVER_USER@$SERVER_IP:$remote_path"
}

# Función para verificar conectividad
check_connection() {
    log "Verificando conectividad con el servidor..."
    
    if ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'Conexión SSH exitosa'" &> /dev/null; then
        log_success "Conexión SSH exitosa"
    else
        log_error "No se puede conectar por SSH al servidor"
        exit 1
    fi
}

# Función para preparar el servidor
prepare_server() {
    log "Preparando servidor..."
    
    # Crear directorios necesarios
    run_remote "sudo mkdir -p $APP_DIR"
    run_remote "sudo chown -R $SERVER_USER:$SERVER_USER $APP_DIR"
    
    # Agregar usuario al grupo docker si no está
    run_remote "sudo usermod -aG docker $SERVER_USER || true"
    
    log_success "Servidor preparado"
}

# Función para subir el proyecto
upload_project() {
    log "Subiendo proyecto al servidor..."
    
    # Crear archivo tar temporal
    local temp_tar="/tmp/social-content-ai-generator.tar.gz"
    
    log "Creando archivo comprimido..."
    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='*.log' \
        --exclude='.env' \
        --exclude='.env.local' \
        --exclude='.env.production' \
        --exclude='backups' \
        -czf "$temp_tar" .
    
    # Subir archivo al servidor
    log "Subiendo archivo al servidor..."
    copy_to_server "$temp_tar" "/tmp/"
    
    # Extraer en el servidor
    log "Extrayendo archivo en el servidor..."
    run_remote "cd $APP_DIR && tar -xzf /tmp/social-content-ai-generator.tar.gz"
    run_remote "rm /tmp/social-content-ai-generator.tar.gz"
    
    # Limpiar archivo temporal local
    rm "$temp_tar"
    
    log_success "Proyecto subido al servidor"
}

# Función para configurar variables de entorno
setup_environment() {
    log "Configurando variables de entorno..."
    
    # Crear archivo .env.production en el servidor
    run_remote "cat > $APP_DIR/.env.production << 'EOF'
# Base de datos MySQL
MYSQL_ROOT_PASSWORD=SocialContent2024!SecureRoot
MYSQL_DATABASE=social_content_ai
MYSQL_USER=social_content_user
MYSQL_PASSWORD=SocialContent2024!SecurePassword
DB_HOST=mysql
DB_PORT=3306
DB_NAME=social_content_ai

# JWT Configuration
JWT_SECRET=SocialContentAI2024!SuperSecureJWTSecretKeyForProductionUse
JWT_EXPIRES_IN=7d

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDG8SWURNuhDS7I78D7dUAJW92x-K0LYhA

# CORS Configuration
ALLOWED_ORIGINS=http://18.191.51.184,http://localhost:80,https://18.191.51.184

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Environment
NODE_ENV=production
PORT=3001

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30

# Monitoring
HEALTH_CHECK_INTERVAL=30
LOG_LEVEL=info

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=SocialContentAI2024!SessionSecretKey
EOF"
    
    log_success "Variables de entorno configuradas"
}

# Función para desplegar la aplicación
deploy_application() {
    log "Desplegando aplicación..."
    
    # Dar permisos de ejecución a los scripts
    run_remote "chmod +x $APP_DIR/scripts/*.sh"
    
    # Detener servicios existentes si están corriendo
    run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml down || true"
    
    # Construir imágenes
    log "Construyendo imágenes Docker..."
    run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml build"
    
    # Iniciar servicios
    log "Iniciando servicios..."
    run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml up -d"
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 60
    
    log_success "Aplicación desplegada"
}

# Función para verificar el despliegue
verify_deployment() {
    log "Verificando despliegue..."
    
    # Verificar contenedores
    log "Estado de los contenedores:"
    run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps"
    
    # Verificar conectividad
    log "Verificando conectividad..."
    
    if curl -f "http://$SERVER_IP:80" >/dev/null 2>&1; then
        log_success "Frontend accesible en http://$SERVER_IP:80"
    else
        log_warning "Frontend no accesible en puerto 80"
    fi
    
    if curl -f "http://$SERVER_IP:3001/health" >/dev/null 2>&1; then
        log_success "Backend accesible en http://$SERVER_IP:3001"
    else
        log_warning "Backend no accesible en puerto 3001"
    fi
}

# Función para mostrar información del despliegue
show_deployment_info() {
    echo ""
    log "=== INFORMACIÓN DEL DESPLIEGUE ==="
    echo ""
    echo "🌐 Servidor: $SERVER_IP"
    echo "👤 Usuario: $SERVER_USER"
    echo "📁 Directorio: $APP_DIR"
    echo ""
    echo "🔗 URLs de acceso:"
    echo "   Frontend: http://$SERVER_IP:80"
    echo "   Backend:  http://$SERVER_IP:3001"
    echo "   Health:   http://$SERVER_IP:3001/health"
    echo ""
    echo "📊 Comandos útiles:"
    echo "   Ver logs: ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs'"
    echo "   Reiniciar: ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml restart'"
    echo "   Estado:   ssh -i $PEM_FILE $SERVER_USER@$SERVER_IP 'cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps'"
    echo ""
}

# Función principal de despliegue
main_deploy() {
    log "=== INICIANDO DESPLIEGUE SIMPLIFICADO ==="
    log "Servidor: $SERVER_IP"
    log "Usuario: $SERVER_USER"
    echo ""
    
    check_connection
    prepare_server
    upload_project
    setup_environment
    deploy_application
    verify_deployment
    show_deployment_info
    
    log_success "=== DESPLIEGUE COMPLETADO EXITOSAMENTE ==="
    log "Tu aplicación está disponible en: http://$SERVER_IP:80"
}

# Main
case "${1:-deploy}" in
    "deploy")
        main_deploy
        ;;
    "upload")
        check_connection
        upload_project
        ;;
    "deploy-app")
        check_connection
        deploy_application
        ;;
    "verify")
        check_connection
        verify_deployment
        ;;
    "logs")
        check_connection
        run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs --tail=50"
        ;;
    "status")
        check_connection
        run_remote "cd $APP_DIR && docker-compose -f docker-compose.prod.yml ps"
        ;;
    "help"|"-h"|"--help")
        echo "Script de despliegue simplificado al servidor AWS"
        echo ""
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponibles:"
        echo "  deploy          - Despliegue completo (default)"
        echo "  upload          - Solo subir proyecto"
        echo "  deploy-app      - Solo desplegar aplicación"
        echo "  verify          - Solo verificar despliegue"
        echo "  logs            - Mostrar logs"
        echo "  status          - Mostrar estado"
        echo "  help            - Mostrar esta ayuda"
        ;;
    *)
        log_error "Comando no reconocido: $1"
        echo "Usar: $0 help"
        exit 1
        ;;
esac
