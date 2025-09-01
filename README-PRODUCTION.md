# 🚀 Guía de Despliegue en Producción - AWS EC2

## 📋 Requisitos Previos

- ✅ Cuenta de AWS activa
- ✅ Dominio registrado (opcional pero recomendado)
- ✅ Conocimientos básicos de Linux y Docker
- ✅ Acceso SSH a tu servidor

## 🏗️ Arquitectura de Producción

```
Internet → CloudFlare (opcional) → EC2 Instance
                                    ├── Nginx (Reverse Proxy)
                                    ├── Frontend (React App)
                                    ├── Backend (Node.js API)
                                    └── MySQL Database
```

## 📝 Pasos de Despliegue

### 1. 🖥️ Configuración de EC2

#### 1.1 Crear Instancia EC2
```bash
# Especificaciones recomendadas:
- Tipo: t3.medium (2 vCPU, 4GB RAM) - mínimo
- Tipo: t3.large (2 vCPU, 8GB RAM) - recomendado
- OS: Ubuntu 22.04 LTS
- Storage: 20GB SSD mínimo
- Security Group: HTTP (80), HTTPS (443), SSH (22)
```

#### 1.2 Conectar al Servidor
```bash
ssh -i tu-key.pem ubuntu@tu-ip-publica
```

### 2. 🔒 Configuración de Seguridad

#### 2.1 Security Groups
```bash
# Reglas necesarias:
- SSH (22): Tu IP solamente
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom (3001): 127.0.0.1/32 (solo localhost)
- Custom (3306): 127.0.0.1/32 (solo localhost)
```

### 3. 🛠️ Instalación de Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Git
sudo apt install -y git

# Instalar herramientas adicionales
sudo apt install -y curl wget unzip
```

### 4. 📁 Preparación del Proyecto

```bash
# Crear directorio del proyecto
sudo mkdir -p /opt/social-content-ai
sudo chown ubuntu:ubuntu /opt/social-content-ai
cd /opt/social-content-ai

# Clonar repositorio
git clone https://github.com/tu-usuario/social-content-ai-generator.git .

# Crear directorios necesarios
mkdir -p ssl logs backups
```

### 5. ⚙️ Configuración de Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.production.example .env.production

# Editar variables de entorno
nano .env.production
```

**Variables importantes a configurar:**
```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=tu_password_root_muy_seguro
MYSQL_DATABASE=social_content_ai
MYSQL_USER=social_content_user
MYSQL_PASSWORD=tu_password_mysql_muy_seguro

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_de_al_menos_32_caracteres

# Gemini AI Configuration
GEMINI_API_KEY=tu_api_key_de_gemini

# CORS Configuration
ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
```

### 6. 🔒 Configuración de SSL (Let's Encrypt)

```bash
# Hacer ejecutables los scripts
chmod +x scripts/*.sh

# Configurar SSL
./scripts/setup-ssl.sh
```

### 7. 🚀 Despliegue

```bash
# Ejecutar despliegue
./scripts/deploy.sh
```

### 8. 📊 Monitoreo

```bash
# Verificar estado del sistema
./scripts/monitoring.sh

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Comandos Útiles

### Gestión de Contenedores
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f [servicio]

# Acceder a contenedor
docker-compose -f docker-compose.prod.yml exec [servicio] bash
```

### Base de Datos
```bash
# Backup manual
./scripts/backup.sh

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE < backup.sql
```

### SSL
```bash
# Renovar certificado
sudo certbot renew

# Verificar certificado
openssl x509 -enddate -noout -in ssl/fullchain.pem
```

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Contenedores no inician**
   ```bash
   # Ver logs de error
   docker-compose -f docker-compose.prod.yml logs
   
   # Verificar variables de entorno
   cat .env.production
   ```

2. **Error de SSL**
   ```bash
   # Verificar certificados
   ls -la ssl/
   
   # Renovar certificado
   sudo certbot renew
   ```

3. **Error de base de datos**
   ```bash
   # Verificar conexión
   docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
   
   # Ver logs de MySQL
   docker-compose -f docker-compose.prod.yml logs mysql
   ```

## 📈 Optimizaciones de Rendimiento

### 1. Configuración de Nginx
- ✅ Compresión Gzip habilitada
- ✅ Cache de archivos estáticos
- ✅ Rate limiting configurado
- ✅ Headers de seguridad

### 2. Configuración de Docker
- ✅ Multi-stage builds
- ✅ Imágenes optimizadas
- ✅ Health checks
- ✅ Restart policies

### 3. Base de Datos
- ✅ Respaldos automáticos
- ✅ Configuración de performance
- ✅ Índices optimizados

## 🔄 CI/CD con GitHub Actions

### Configuración de Secrets
En GitHub, ve a Settings > Secrets y agrega:
- `SSH_PRIVATE_KEY`: Tu clave SSH privada
- `SERVER_HOST`: IP de tu servidor EC2
- `DOMAIN`: Tu dominio

### Automatización
- ✅ Deploy automático en push a main
- ✅ Health checks post-deploy
- ✅ Notificaciones de estado

## 📊 Monitoreo y Logs

### Logs de Aplicación
```bash
# Ver logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Métricas del Sistema
```bash
# Uso de recursos
htop

# Espacio en disco
df -h

# Memoria
free -h
```

## 🛡️ Seguridad

### Recomendaciones
- ✅ Firewall configurado
- ✅ SSH con claves
- ✅ Certificados SSL válidos
- ✅ Rate limiting
- ✅ Headers de seguridad
- ✅ Respaldos automáticos

### Actualizaciones
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Actualizar Docker
sudo apt update && sudo apt install docker-ce docker-ce-cli containerd.io
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verifica el estado: `./scripts/monitoring.sh`
3. Consulta la documentación
4. Crea un issue en GitHub

---

**¡Tu aplicación está lista para producción! 🎉**
