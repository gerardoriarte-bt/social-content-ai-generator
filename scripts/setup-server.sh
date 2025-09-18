#!/bin/bash

# Script de configuración inicial del servidor
# Este script prepara el servidor para el despliegue de la aplicación

set -e

# Configuración
APP_USER="social-content"
APP_DIR="/opt/social-content-ai"
BACKUP_DIR="/opt/social-content-ai/backups"
LOG_DIR="/opt/social-content-ai/logs"

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

# Función para verificar si se ejecuta como root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script debe ejecutarse como root"
        log "Usar: sudo $0"
        exit 1
    fi
}

# Función para actualizar el sistema
update_system() {
    log "Actualizando sistema..."
    
    apt-get update
    apt-get upgrade -y
    
    log_success "Sistema actualizado"
}

# Función para instalar dependencias
install_dependencies() {
    log "Instalando dependencias..."
    
    # Instalar paquetes básicos
    apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        htop \
        nano \
        vim \
        ufw \
        fail2ban \
        cron \
        logrotate
    
    log_success "Dependencias instaladas"
}

# Función para instalar Docker
install_docker() {
    log "Instalando Docker..."
    
    # Agregar clave GPG de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Agregar repositorio de Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Actualizar e instalar Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Iniciar y habilitar Docker
    systemctl start docker
    systemctl enable docker
    
    log_success "Docker instalado"
}

# Función para instalar Docker Compose
install_docker_compose() {
    log "Instalando Docker Compose..."
    
    # Descargar Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Hacer ejecutable
    chmod +x /usr/local/bin/docker-compose
    
    # Crear enlace simbólico
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    log_success "Docker Compose instalado"
}

# Función para crear usuario de aplicación
create_app_user() {
    log "Creando usuario de aplicación..."
    
    # Crear usuario si no existe
    if ! id "$APP_USER" &>/dev/null; then
        useradd -r -s /bin/bash -d "$APP_DIR" -m "$APP_USER"
        log_success "Usuario $APP_USER creado"
    else
        log_warning "Usuario $APP_USER ya existe"
    fi
    
    # Agregar usuario al grupo docker
    usermod -aG docker "$APP_USER"
    
    log_success "Usuario configurado"
}

# Función para crear directorios de la aplicación
create_app_directories() {
    log "Creando directorios de la aplicación..."
    
    # Crear directorios principales
    mkdir -p "$APP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR"
    
    # Establecer permisos
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    chmod 755 "$APP_DIR"
    chmod 755 "$BACKUP_DIR"
    chmod 755 "$LOG_DIR"
    
    log_success "Directorios creados"
}

# Función para configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    # Habilitar UFW
    ufw --force enable
    
    # Reglas básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH
    ufw allow ssh
    
    # Permitir HTTP y HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir puerto de aplicación (opcional)
    ufw allow 3001/tcp
    
    log_success "Firewall configurado"
}

# Función para configurar fail2ban
configure_fail2ban() {
    log "Configurando fail2ban..."
    
    # Crear configuración personalizada
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3
EOF
    
    # Reiniciar fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    log_success "Fail2ban configurado"
}

# Función para configurar logrotate
configure_logrotate() {
    log "Configurando logrotate..."
    
    # Crear configuración de logrotate para la aplicación
    cat > /etc/logrotate.d/social-content-ai << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
    postrotate
        # Reiniciar servicios si es necesario
        systemctl reload docker-compose@social-content-ai 2>/dev/null || true
    endscript
}
EOF
    
    log_success "Logrotate configurado"
}

# Función para configurar cron para backups
configure_backup_cron() {
    log "Configurando cron para backups..."
    
    # Crear script de backup diario
    cat > /usr/local/bin/daily-backup.sh << 'EOF'
#!/bin/bash
cd /opt/social-content-ai
sudo -u social-content ./scripts/backup-production.sh backup
EOF
    
    chmod +x /usr/local/bin/daily-backup.sh
    
    # Agregar al crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/daily-backup.sh >> /var/log/backup.log 2>&1") | crontab -
    
    log_success "Cron de backup configurado"
}

# Función para configurar monitoreo básico
configure_monitoring() {
    log "Configurando monitoreo básico..."
    
    # Crear script de monitoreo
    cat > /usr/local/bin/monitor-app.sh << 'EOF'
#!/bin/bash
LOG_FILE="/var/log/app-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Verificar Docker
if ! systemctl is-active --quiet docker; then
    echo "[$DATE] ERROR: Docker no está corriendo" >> $LOG_FILE
    systemctl start docker
fi

# Verificar contenedores
if ! docker ps | grep -q "social-content"; then
    echo "[$DATE] WARNING: Contenedores de la aplicación no están corriendo" >> $LOG_FILE
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$DATE] WARNING: Espacio en disco bajo: ${DISK_USAGE}%" >> $LOG_FILE
fi

# Verificar memoria
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEM_USAGE" -gt 90 ]; then
    echo "[$DATE] WARNING: Uso de memoria alto: ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF
    
    chmod +x /usr/local/bin/monitor-app.sh
    
    # Agregar al crontab (cada 5 minutos)
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-app.sh") | crontab -
    
    log_success "Monitoreo configurado"
}

# Función para crear script de inicio del sistema
create_startup_script() {
    log "Creando script de inicio del sistema..."
    
    cat > /etc/systemd/system/social-content-ai.service << EOF
[Unit]
Description=Social Content AI Generator
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=$APP_USER

[Install]
WantedBy=multi-user.target
EOF
    
    # Recargar systemd y habilitar servicio
    systemctl daemon-reload
    systemctl enable social-content-ai.service
    
    log_success "Script de inicio creado"
}

# Función para mostrar información del sistema
show_system_info() {
    log "Información del sistema:"
    echo ""
    echo "Sistema operativo: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Arquitectura: $(uname -m)"
    echo "Memoria RAM: $(free -h | awk 'NR==2{print $2}')"
    echo "Espacio en disco: $(df -h / | awk 'NR==2{print $2}')"
    echo ""
    echo "Docker versión: $(docker --version)"
    echo "Docker Compose versión: $(docker-compose --version)"
    echo ""
    echo "Usuario de aplicación: $APP_USER"
    echo "Directorio de aplicación: $APP_DIR"
    echo "Directorio de backups: $BACKUP_DIR"
    echo "Directorio de logs: $LOG_DIR"
}

# Función para mostrar ayuda
show_help() {
    echo "Script de configuración inicial del servidor"
    echo ""
    echo "Uso: sudo $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  setup           - Configuración completa (default)"
    echo "  update          - Solo actualizar sistema"
    echo "  install-deps    - Solo instalar dependencias"
    echo "  install-docker  - Solo instalar Docker"
    echo "  create-user     - Solo crear usuario de aplicación"
    echo "  configure-fw    - Solo configurar firewall"
    echo "  info            - Mostrar información del sistema"
    echo "  help            - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  sudo $0 setup"
    echo "  sudo $0 info"
}

# Función principal de configuración
main_setup() {
    log "=== INICIANDO CONFIGURACIÓN DEL SERVIDOR ==="
    
    check_root
    update_system
    install_dependencies
    install_docker
    install_docker_compose
    create_app_user
    create_app_directories
    configure_firewall
    configure_fail2ban
    configure_logrotate
    configure_backup_cron
    configure_monitoring
    create_startup_script
    
    log_success "=== CONFIGURACIÓN DEL SERVIDOR COMPLETADA ==="
    log "El servidor está listo para el despliegue de la aplicación"
    log "Próximos pasos:"
    log "1. Copiar el código de la aplicación a $APP_DIR"
    log "2. Configurar archivo .env.production"
    log "3. Ejecutar: sudo -u $APP_USER ./scripts/deploy-production.sh deploy"
}

# Main
case "${1:-setup}" in
    "setup")
        main_setup
        ;;
    "update")
        check_root
        update_system
        ;;
    "install-deps")
        check_root
        install_dependencies
        ;;
    "install-docker")
        check_root
        install_docker
        install_docker_compose
        ;;
    "create-user")
        check_root
        create_app_user
        create_app_directories
        ;;
    "configure-fw")
        check_root
        configure_firewall
        configure_fail2ban
        ;;
    "info")
        show_system_info
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
