# 🐳 Solución de Problemas Docker - Social Content AI Generator

## ❌ Problemas Identificados

1. **GEMINI_API_KEY no configurada** - Variable de entorno faltante
2. **Versión obsoleta en docker-compose** - Atributo `version` deprecated
3. **Error de acceso a base de datos** - Credenciales incorrectas para migraciones

## ✅ Soluciones Aplicadas

### 1. **Configuración de Variables de Entorno**

#### Crear archivo `.env` en la raíz del proyecto:
```bash
cp env.example .env
```

#### Editar `.env` y agregar tu API key de Gemini:
```env
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

**Obtener API Key de Gemini:**
1. Ve a https://makersuite.google.com/app/apikey
2. Crea una nueva API key
3. Copia la key y pégala en el archivo `.env`

### 2. **Docker Compose Corregido**

- ✅ Removido atributo `version` obsoleto
- ✅ Configuración de variables de entorno mejorada
- ✅ Health checks para MySQL configurados

### 3. **Scripts de Migración Mejorados**

#### Para desarrollo con Docker:
```bash
cd backend
DB_HOST=mysql-dev DB_PORT=3306 node scripts/run-migrations-docker.js
```

#### Para desarrollo local:
```bash
cd backend
node scripts/run-migrations-fixed.js
```

## 🚀 Instrucciones de Setup Completo

### Opción 1: Script Automatizado (Recomendado)
```bash
./setup-dev.sh
```

### Opción 2: Setup Manual

#### 1. **Configurar Variables de Entorno**
```bash
# Copiar template
cp env.example .env

# Editar y agregar GEMINI_API_KEY
nano .env
```

#### 2. **Iniciar Base de Datos**
```bash
docker-compose -f docker-compose.dev.yml up -d mysql-dev
```

#### 3. **Esperar que MySQL esté listo**
```bash
# Verificar que MySQL esté corriendo
docker-compose -f docker-compose.dev.yml ps mysql-dev

# Ver logs si hay problemas
docker-compose -f docker-compose.dev.yml logs mysql-dev
```

#### 4. **Ejecutar Migraciones**
```bash
cd backend
DB_HOST=mysql-dev DB_PORT=3306 node scripts/run-migrations-docker.js
```

#### 5. **Iniciar Servicios**
```bash
# Opción A: Todo junto
docker-compose -f docker-compose.dev.yml up

# Opción B: Por separado
docker-compose -f docker-compose.dev.yml up backend-dev
docker-compose -f docker-compose.dev.yml up frontend-dev
```

## 🔍 Verificación de Setup

### 1. **Verificar Variables de Entorno**
```bash
docker exec social-content-ai-generator-backend-dev-1 env | grep GEMINI
```

### 2. **Verificar Base de Datos**
```bash
# Conectar a MySQL
docker exec -it social-content-ai-generator-mysql-dev-1 mysql -u social_content_user -p social_content_ai

# Verificar tablas
SHOW TABLES;
```

### 3. **Verificar APIs**
```bash
# Backend health check
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

## 🛠️ Troubleshooting

### Error: "Access denied for user"
```bash
# Verificar que MySQL esté corriendo
docker-compose -f docker-compose.dev.yml ps mysql-dev

# Reiniciar MySQL si es necesario
docker-compose -f docker-compose.dev.yml restart mysql-dev
```

### Error: "GEMINI_API_KEY not set"
```bash
# Verificar archivo .env
cat .env | grep GEMINI_API_KEY

# Reiniciar servicios después de cambiar .env
docker-compose -f docker-compose.dev.yml restart
```

### Error: "Port already in use"
```bash
# Verificar puertos en uso
lsof -i :3000
lsof -i :3001
lsof -i :3307

# Detener servicios conflictivos
docker-compose -f docker-compose.dev.yml down
```

## 📋 Comandos Útiles

### Gestión de Docker
```bash
# Ver servicios corriendo
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart

# Detener todo
docker-compose -f docker-compose.dev.yml down

# Limpiar volúmenes (⚠️ Borra datos)
docker-compose -f docker-compose.dev.yml down -v
```

### Base de Datos
```bash
# Conectar a MySQL
docker exec -it social-content-ai-generator-mysql-dev-1 mysql -u social_content_user -p

# Backup de base de datos
docker exec social-content-ai-generator-mysql-dev-1 mysqldump -u social_content_user -p social_content_ai > backup.sql

# Restaurar base de datos
docker exec -i social-content-ai-generator-mysql-dev-1 mysql -u social_content_user -p social_content_ai < backup.sql
```

## 🎯 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Base de Datos**: localhost:3307
- **Health Check**: http://localhost:3001/health

## ✅ Checklist de Setup

- [ ] Archivo `.env` creado con `GEMINI_API_KEY`
- [ ] Docker corriendo
- [ ] MySQL iniciado y saludable
- [ ] Migraciones ejecutadas exitosamente
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] APIs respondiendo correctamente

¡Una vez completado este checklist, la aplicación estará lista para usar! 🎉
