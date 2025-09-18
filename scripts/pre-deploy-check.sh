#!/bin/bash

# Script de verificación pre-despliegue
# Este script verifica que todo esté listo para el despliegue en producción

set -e

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

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Función para verificar archivo
check_file() {
    local file="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        log_success "$description: $file"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        log_error "$description: $file (NO ENCONTRADO)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para verificar comando
check_command() {
    local cmd="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if command -v "$cmd" &> /dev/null; then
        log_success "$description: $cmd"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        log_error "$description: $cmd (NO INSTALADO)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para verificar variable de entorno
check_env_var() {
    local var="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -n "${!var}" ]; then
        log_success "$description: ${var} configurada"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        log_error "$description: ${var} (NO CONFIGURADA)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# Función para verificar puerto
check_port() {
    local port="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if netstat -tuln | grep -q ":$port "; then
        log_warning "$description: Puerto $port está en uso"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        return 1
    else
        log_success "$description: Puerto $port disponible"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    fi
}

# Función para verificar Docker
check_docker() {
    log "Verificando Docker..."
    
    check_command "docker" "Docker instalado"
    check_command "docker-compose" "Docker Compose instalado"
    
    # Verificar que Docker esté corriendo
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if docker info &> /dev/null; then
        log_success "Docker está corriendo"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_error "Docker no está corriendo"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Función para verificar archivos de configuración
check_config_files() {
    log "Verificando archivos de configuración..."
    
    check_file "docker-compose.prod.yml" "Docker Compose de producción"
    check_file "env.production.template" "Template de variables de entorno"
    
    # Verificar si existe .env.production
    if [ -f ".env.production" ]; then
        log_success "Archivo .env.production encontrado"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_warning "Archivo .env.production no encontrado (usar env.production.template)"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
}

# Función para verificar variables de entorno críticas
check_critical_env_vars() {
    log "Verificando variables de entorno críticas..."
    
    if [ -f ".env.production" ]; then
        source .env.production
        
        check_env_var "MYSQL_ROOT_PASSWORD" "Password root de MySQL"
        check_env_var "MYSQL_PASSWORD" "Password de usuario MySQL"
        check_env_var "JWT_SECRET" "Secret JWT"
        check_env_var "GEMINI_API_KEY" "API Key de Gemini"
    else
        log_warning "No se puede verificar variables de entorno (archivo .env.production no encontrado)"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    fi
}

# Función para verificar puertos
check_ports() {
    log "Verificando puertos..."
    
    check_port "80" "Puerto HTTP"
    check_port "443" "Puerto HTTPS"
    check_port "3001" "Puerto Backend"
    check_port "3306" "Puerto MySQL"
}

# Función para verificar estructura del proyecto
check_project_structure() {
    log "Verificando estructura del proyecto..."
    
    check_file "package.json" "Package.json del frontend"
    check_file "backend/package.json" "Package.json del backend"
    check_file "backend/Dockerfile" "Dockerfile del backend"
    check_file "Dockerfile" "Dockerfile del frontend"
    check_file "backend/database/init.sql" "Script de inicialización de BD"
    check_file "backend/scripts/run-migrations.js" "Script de migraciones"
}

# Función para verificar scripts de despliegue
check_deployment_scripts() {
    log "Verificando scripts de despliegue..."
    
    check_file "scripts/deploy-production.sh" "Script de despliegue"
    check_file "scripts/backup-production.sh" "Script de backup"
    check_file "scripts/setup-server.sh" "Script de configuración del servidor"
    check_file "scripts/pre-deploy-check.sh" "Script de verificación pre-despliegue"
    
    # Verificar permisos de ejecución
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -x "scripts/deploy-production.sh" ]; then
        log_success "Script de despliegue tiene permisos de ejecución"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_error "Script de despliegue no tiene permisos de ejecución"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Función para verificar espacio en disco
check_disk_space() {
    log "Verificando espacio en disco..."
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Verificar espacio disponible (mínimo 5GB)
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    AVAILABLE_SPACE_GB=$((AVAILABLE_SPACE / 1024 / 1024))
    
    if [ "$AVAILABLE_SPACE_GB" -ge 5 ]; then
        log_success "Espacio en disco: ${AVAILABLE_SPACE_GB}GB disponible"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_error "Espacio en disco insuficiente: ${AVAILABLE_SPACE_GB}GB (mínimo 5GB)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Función para verificar memoria RAM
check_memory() {
    log "Verificando memoria RAM..."
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Verificar memoria disponible (mínimo 2GB)
    AVAILABLE_MEMORY=$(free -m | awk 'NR==2{print $7}')
    
    if [ "$AVAILABLE_MEMORY" -ge 2048 ]; then
        log_success "Memoria RAM: ${AVAILABLE_MEMORY}MB disponible"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_warning "Memoria RAM baja: ${AVAILABLE_MEMORY}MB (recomendado 2GB+)"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
}

# Función para verificar conectividad de red
check_network() {
    log "Verificando conectividad de red..."
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if ping -c 1 google.com &> /dev/null; then
        log_success "Conectividad de red: OK"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_warning "Conectividad de red: Limitada"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
}

# Función para verificar usuario
check_user() {
    log "Verificando usuario actual..."
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    CURRENT_USER=$(whoami)
    if [ "$CURRENT_USER" = "root" ] || [ "$CURRENT_USER" = "social-content" ]; then
        log_success "Usuario apropiado: $CURRENT_USER"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        log_warning "Usuario actual: $CURRENT_USER (recomendado: root o social-content)"
        WARNING_CHECKS=$((WARNING_CHECKS + 1))
    fi
}

# Función para mostrar resumen
show_summary() {
    echo ""
    log "=== RESUMEN DE VERIFICACIÓN ==="
    echo ""
    echo "Total de verificaciones: $TOTAL_CHECKS"
    echo -e "${GREEN}✅ Exitosas: $PASSED_CHECKS${NC}"
    echo -e "${YELLOW}⚠️  Advertencias: $WARNING_CHECKS${NC}"
    echo -e "${RED}❌ Fallidas: $FAILED_CHECKS${NC}"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        if [ $WARNING_CHECKS -eq 0 ]; then
            log_success "¡Todo está listo para el despliegue!"
            echo ""
            echo "Próximos pasos:"
            echo "1. ./scripts/deploy-production.sh deploy"
            echo "2. Verificar que la aplicación esté funcionando"
            echo "3. Configurar backup automático"
            return 0
        else
            log_warning "Despliegue posible con advertencias"
            echo ""
            echo "Revisar las advertencias antes de continuar"
            return 1
        fi
    else
        log_error "Despliegue no recomendado"
        echo ""
        echo "Corregir los errores antes de continuar:"
        echo "1. Revisar archivos faltantes"
        echo "2. Configurar variables de entorno"
        echo "3. Instalar dependencias faltantes"
        return 1
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Script de verificación pre-despliegue"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --quick         - Verificación rápida (solo archivos críticos)"
    echo "  --full          - Verificación completa (default)"
    echo "  --help          - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0"
    echo "  $0 --quick"
}

# Función para verificación rápida
quick_check() {
    log "=== VERIFICACIÓN RÁPIDA ==="
    
    check_docker
    check_config_files
    check_deployment_scripts
    
    show_summary
}

# Función para verificación completa
full_check() {
    log "=== VERIFICACIÓN COMPLETA ==="
    
    check_user
    check_docker
    check_config_files
    check_critical_env_vars
    check_project_structure
    check_deployment_scripts
    check_ports
    check_disk_space
    check_memory
    check_network
    
    show_summary
}

# Main
case "${1:-full}" in
    "quick")
        quick_check
        ;;
    "full")
        full_check
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Opción no reconocida: $1"
        show_help
        exit 1
        ;;
esac