#!/bin/bash

# Script de backup para producción
# Este script crea backups automáticos de la base de datos y archivos de configuración

set -e

# Configuración
BACKUP_DIR="/opt/social-content-ai/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${MYSQL_DATABASE:-social_content_ai}"
DB_USER="${MYSQL_USER:-social_content_user}"
DB_PASSWORD="${MYSQL_PASSWORD:-social_content_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para crear backup de base de datos
backup_database() {
    log "Iniciando backup de base de datos..."
    
    local backup_file="$BACKUP_DIR/db_backup_$DATE.sql"
    
    # Crear backup de la base de datos
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --hex-blob \
        --complete-insert \
        "$DB_NAME" > "$backup_file"
    
    # Comprimir el backup
    gzip "$backup_file"
    
    log "Backup de base de datos creado: ${backup_file}.gz"
    
    # Verificar integridad del backup
    if gzip -t "${backup_file}.gz"; then
        log "Backup de base de datos verificado correctamente"
    else
        log "ERROR: Backup de base de datos corrupto"
        exit 1
    fi
}

# Función para crear backup de archivos de configuración
backup_config() {
    log "Iniciando backup de archivos de configuración..."
    
    local config_backup="$BACKUP_DIR/config_backup_$DATE.tar.gz"
    
    # Crear backup de archivos importantes
    tar -czf "$config_backup" \
        docker-compose.prod.yml \
        .env.production \
        backend/database/init.sql \
        backend/database/migrations/ \
        scripts/ \
        nginx/ \
        2>/dev/null || true
    
    log "Backup de configuración creado: $config_backup"
}

# Función para limpiar backups antiguos (mantener últimos 30 días)
cleanup_old_backups() {
    log "Limpiando backups antiguos..."
    
    find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +30 -delete
    find "$BACKUP_DIR" -name "config_backup_*.tar.gz" -mtime +30 -delete
    
    log "Backups antiguos eliminados"
}

# Función para crear backup completo
full_backup() {
    log "=== INICIANDO BACKUP COMPLETO ==="
    
    backup_database
    backup_config
    cleanup_old_backups
    
    log "=== BACKUP COMPLETO FINALIZADO ==="
}

# Función para restaurar backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log "ERROR: Debe especificar el archivo de backup a restaurar"
        echo "Uso: $0 restore <archivo_backup.sql.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log "ERROR: Archivo de backup no encontrado: $backup_file"
        exit 1
    fi
    
    log "Restaurando backup: $backup_file"
    
    # Descomprimir y restaurar
    gunzip -c "$backup_file" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    
    log "Backup restaurado correctamente"
}

# Función para listar backups disponibles
list_backups() {
    log "Backups disponibles:"
    echo ""
    echo "Base de datos:"
    ls -la "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null || echo "No hay backups de base de datos"
    echo ""
    echo "Configuración:"
    ls -la "$BACKUP_DIR"/config_backup_*.tar.gz 2>/dev/null || echo "No hay backups de configuración"
}

# Función para mostrar estadísticas de backup
backup_stats() {
    log "Estadísticas de backup:"
    echo ""
    echo "Tamaño total de backups:"
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "Directorio de backup no encontrado"
    echo ""
    echo "Número de backups de base de datos:"
    ls -1 "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | wc -l || echo "0"
    echo ""
    echo "Número de backups de configuración:"
    ls -1 "$BACKUP_DIR"/config_backup_*.tar.gz 2>/dev/null | wc -l || echo "0"
}

# Función para crear backup de emergencia (solo datos críticos)
emergency_backup() {
    log "=== BACKUP DE EMERGENCIA ==="
    
    local emergency_backup="$BACKUP_DIR/emergency_backup_$DATE.sql"
    
    # Solo tablas críticas
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --complete-insert \
        "$DB_NAME" companies business_lines users > "$emergency_backup"
    
    gzip "$emergency_backup"
    
    log "Backup de emergencia creado: ${emergency_backup}.gz"
}

# Función para verificar conectividad de base de datos
check_database() {
    log "Verificando conectividad de base de datos..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" >/dev/null 2>&1; then
        log "Conexión a base de datos exitosa"
    else
        log "ERROR: No se puede conectar a la base de datos"
        exit 1
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Script de backup para Social Content AI Generator"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  backup          - Crear backup completo"
    echo "  restore <file>  - Restaurar backup"
    echo "  list            - Listar backups disponibles"
    echo "  stats           - Mostrar estadísticas de backup"
    echo "  emergency       - Crear backup de emergencia"
    echo "  check           - Verificar conectividad de base de datos"
    echo "  help            - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 backup"
    echo "  $0 restore /opt/social-content-ai/backups/db_backup_20241218_143022.sql.gz"
    echo "  $0 list"
}

# Main
case "${1:-backup}" in
    "backup")
        check_database
        full_backup
        ;;
    "restore")
        check_database
        restore_backup "$2"
        ;;
    "list")
        list_backups
        ;;
    "stats")
        backup_stats
        ;;
    "emergency")
        check_database
        emergency_backup
        ;;
    "check")
        check_database
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log "ERROR: Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
