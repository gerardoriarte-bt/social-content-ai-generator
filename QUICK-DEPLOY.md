# 🚀 Despliegue Rápido en Producción

## ⚡ Instrucciones Rápidas

### 1. **Preparar Servidor**
```bash
# Conectar al servidor
ssh root@tu-servidor.com

# Configurar servidor automáticamente
curl -fsSL https://raw.githubusercontent.com/tu-usuario/social-content-ai-generator/main/scripts/setup-server.sh | bash
```

### 2. **Configurar Aplicación**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/social-content-ai-generator.git
cd social-content-ai-generator

# Configurar variables de entorno
cp env.production.template .env.production
nano .env.production  # Editar con tus datos
```

### 3. **Verificar Pre-Despliegue**
```bash
# Verificar que todo esté listo
./scripts/pre-deploy-check.sh
```

### 4. **Desplegar**
```bash
# Cambiar al usuario de aplicación
sudo su - social-content

# Desplegar aplicación
cd /opt/social-content-ai
./scripts/deploy-production.sh deploy
```

### 5. **Verificar Despliegue**
```bash
# Verificar estado
./scripts/deploy-production.sh status

# Verificar aplicación
curl http://localhost:80
```

## 🔧 Configuración Rápida de Variables

Editar `.env.production`:

```bash
# Base de datos
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_PASSWORD=tu_password_mysql_seguro

# JWT
JWT_SECRET=tu_jwt_secret_de_al_menos_32_caracteres

# Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini

# Dominio (opcional)
ALLOWED_ORIGINS=https://tu-dominio.com
```

## 📋 Checklist Rápido

- [ ] Servidor configurado
- [ ] Variables de entorno configuradas
- [ ] Verificación pre-despliegue exitosa
- [ ] Aplicación desplegada
- [ ] Aplicación accesible
- [ ] Backup automático funcionando

## 🆘 Comandos de Emergencia

```bash
# Ver logs
./scripts/deploy-production.sh logs

# Reiniciar servicios
./scripts/deploy-production.sh restart

# Hacer backup de emergencia
./scripts/backup-production.sh emergency

# Rollback
./scripts/deploy-production.sh rollback
```

¡Listo! Tu aplicación está en producción 🎉
