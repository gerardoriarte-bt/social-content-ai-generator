# 🚀 Guía de Despliegue en Producción

Esta guía te ayudará a desplegar la aplicación Social Content AI Generator en un servidor de producción de manera segura y confiable.

## 📋 Prerrequisitos

- Servidor Ubuntu 20.04+ o similar
- Acceso root al servidor
- Dominio configurado (opcional)
- Certificado SSL (recomendado)

## 🛠️ Configuración Inicial del Servidor

### 1. Conectar al Servidor

```bash
ssh root@tu-servidor.com
```

### 2. Ejecutar Configuración Automática

```bash
# Descargar y ejecutar script de configuración
curl -fsSL https://raw.githubusercontent.com/tu-usuario/social-content-ai-generator/main/scripts/setup-server.sh | bash
```

O manualmente:

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/social-content-ai-generator.git
cd social-content-ai-generator

# Ejecutar configuración
sudo ./scripts/setup-server.sh setup
```

### 3. Verificar Configuración

```bash
# Verificar información del sistema
sudo ./scripts/setup-server.sh info

# Verificar Docker
docker --version
docker-compose --version
```

## 🔧 Configuración de la Aplicación

### 1. Configurar Variables de Entorno

```bash
# Copiar template de configuración
cp env.production.template .env.production

# Editar configuración
nano .env.production
```

**Configuraciones importantes:**

```bash
# Base de datos
MYSQL_ROOT_PASSWORD=tu_password_root_muy_seguro
MYSQL_PASSWORD=tu_password_mysql_muy_seguro

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_de_al_menos_32_caracteres

# Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini

# CORS (actualizar con tu dominio)
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### 2. Configurar Dominio (Opcional)

Si tienes un dominio, actualiza el archivo `docker-compose.prod.yml`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`tu-dominio.com`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

## 🚀 Despliegue

### 1. Despliegue Automático

```bash
# Cambiar al usuario de la aplicación
sudo su - social-content

# Navegar al directorio
cd /opt/social-content-ai

# Ejecutar despliegue
./scripts/deploy-production.sh deploy
```

### 2. Verificar Despliegue

```bash
# Verificar estado de servicios
./scripts/deploy-production.sh status

# Ver logs
./scripts/deploy-production.sh logs

# Verificar conectividad
curl http://localhost:80
curl http://localhost:3001/health
```

## 💾 Sistema de Backup

### 1. Backup Automático

El sistema está configurado para hacer backups automáticos diarios a las 2:00 AM.

### 2. Backup Manual

```bash
# Backup completo
./scripts/backup-production.sh backup

# Backup de emergencia
./scripts/backup-production.sh emergency

# Listar backups
./scripts/backup-production.sh list
```

### 3. Restaurar Backup

```bash
# Restaurar backup más reciente
./scripts/backup-production.sh restore /opt/social-content-ai/backups/db_backup_20241218_143022.sql.gz
```

## 🔍 Monitoreo y Mantenimiento

### 1. Verificar Estado

```bash
# Estado de servicios
./scripts/deploy-production.sh status

# Logs de la aplicación
./scripts/deploy-production.sh logs

# Logs del sistema
tail -f /var/log/app-monitor.log
```

### 2. Actualizaciones

```bash
# Actualizar aplicación
git pull origin main
./scripts/deploy-production.sh deploy

# Limpiar recursos
./scripts/deploy-production.sh cleanup
```

### 3. Rollback

```bash
# Hacer rollback a versión anterior
./scripts/deploy-production.sh rollback
```

## 🔒 Seguridad

### 1. Firewall

El firewall está configurado para permitir solo:
- SSH (puerto 22)
- HTTP (puerto 80)
- HTTPS (puerto 443)
- Puerto de aplicación (puerto 3001)

### 2. Fail2ban

Configurado para proteger contra ataques de fuerza bruta.

### 3. SSL/TLS

Para habilitar SSL, configura un proxy reverso como Nginx o Traefik.

## 📊 Monitoreo de Recursos

### 1. Espacio en Disco

```bash
# Verificar espacio
df -h

# Limpiar logs antiguos
sudo logrotate -f /etc/logrotate.d/social-content-ai
```

### 2. Memoria y CPU

```bash
# Monitoreo en tiempo real
htop

# Verificar contenedores
docker stats
```

## 🆘 Solución de Problemas

### 1. Servicios No Inician

```bash
# Verificar logs de Docker
docker-compose -f docker-compose.prod.yml logs

# Reiniciar servicios
./scripts/deploy-production.sh restart
```

### 2. Base de Datos No Conecta

```bash
# Verificar estado de MySQL
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping

# Verificar logs de MySQL
docker-compose -f docker-compose.prod.yml logs mysql
```

### 3. Aplicación No Responde

```bash
# Verificar health checks
curl http://localhost:3001/health

# Reiniciar aplicación
./scripts/deploy-production.sh restart
```

## 📝 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
./scripts/deploy-production.sh start

# Detener servicios
./scripts/deploy-production.sh stop

# Reiniciar servicios
./scripts/deploy-production.sh restart
```

### Gestión de Backups

```bash
# Backup completo
./scripts/backup-production.sh backup

# Listar backups
./scripts/backup-production.sh list

# Estadísticas de backup
./scripts/backup-production.sh stats
```

### Monitoreo

```bash
# Verificar despliegue
./scripts/deploy-production.sh verify

# Limpiar recursos
./scripts/deploy-production.sh cleanup
```

## 🔄 Actualizaciones Automáticas

Para configurar actualizaciones automáticas:

```bash
# Agregar al crontab
crontab -e

# Agregar línea para actualización semanal
0 3 * * 0 cd /opt/social-content-ai && git pull origin main && ./scripts/deploy-production.sh deploy
```

## 📞 Soporte

Si encuentras problemas:

1. Verificar logs: `./scripts/deploy-production.sh logs`
2. Verificar estado: `./scripts/deploy-production.sh status`
3. Hacer backup: `./scripts/backup-production.sh emergency`
4. Contactar soporte técnico

## ✅ Checklist de Despliegue

- [ ] Servidor configurado con `setup-server.sh`
- [ ] Variables de entorno configuradas en `.env.production`
- [ ] Dominio configurado (opcional)
- [ ] SSL configurado (recomendado)
- [ ] Aplicación desplegada con `deploy-production.sh`
- [ ] Backup automático funcionando
- [ ] Monitoreo configurado
- [ ] Firewall configurado
- [ ] Aplicación accesible en http://tu-servidor.com

¡Tu aplicación está lista para producción! 🎉
