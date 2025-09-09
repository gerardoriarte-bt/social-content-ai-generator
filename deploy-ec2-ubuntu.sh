#!/bin/bash

# Script de despliegue para EC2 Ubuntu
set -e  # Salir si hay algún error

# Configuración
EC2_HOST="18.191.51.184"
EC2_USER="ubuntu"
PEM_FILE="/Users/buentipo/Downloads/social_contentbt.pem"
APP_NAME="social-content-ai-generator"
APP_DIR="/home/ubuntu/$APP_NAME"

echo "🚀 Iniciando despliegue en EC2 Ubuntu ($EC2_HOST)..."

# Función para ejecutar comandos en EC2
run_remote() {
    echo "🔧 Ejecutando: $1"
    ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$1"
}

# Función para copiar archivos a EC2
copy_to_remote() {
    echo "📤 Copiando: $1 -> $2"
    scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r "$1" "$EC2_USER@$EC2_HOST:$2"
}

echo "📦 Actualizando sistema..."
run_remote "sudo apt update && sudo apt upgrade -y"

echo "🔧 Instalando Node.js..."
run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
run_remote "sudo apt-get install -y nodejs"

echo "🐳 Instalando Docker..."
run_remote "sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release"
run_remote "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg"
run_remote "echo \"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null"
run_remote "sudo apt-get update"
run_remote "sudo apt-get install -y docker-ce docker-ce-cli containerd.io"
run_remote "sudo systemctl start docker"
run_remote "sudo systemctl enable docker"
run_remote "sudo usermod -a -G docker ubuntu"

echo "📁 Preparando directorio de la aplicación..."
run_remote "rm -rf $APP_DIR"
run_remote "mkdir -p $APP_DIR"

echo "📤 Copiando archivos de la aplicación..."
# Copiar archivos necesarios
copy_to_remote "package.json" "$APP_DIR/"
copy_to_remote "package-lock.json" "$APP_DIR/"
copy_to_remote "vite.config.ts" "$APP_DIR/"
copy_to_remote "tsconfig.json" "$APP_DIR/"
copy_to_remote "index.html" "$APP_DIR/"
copy_to_remote "index.tsx" "$APP_DIR/"
copy_to_remote "App.tsx" "$APP_DIR/"
copy_to_remote "types.ts" "$APP_DIR/"
copy_to_remote "components/" "$APP_DIR/"
copy_to_remote "services/" "$APP_DIR/"
copy_to_remote "backend/" "$APP_DIR/"

echo "🔧 Instalando dependencias..."
run_remote "cd $APP_DIR && npm install"
run_remote "cd $APP_DIR/backend && npm install"

echo "🏗️ Construyendo aplicación frontend..."
run_remote "cd $APP_DIR && npm run build"

echo "🗄️ Configurando base de datos MySQL..."
run_remote "docker stop social-content-mysql || true"
run_remote "docker rm social-content-mysql || true"
run_remote "docker run --name social-content-mysql -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=social_content_ai -e MYSQL_USER=social_content_user -e MYSQL_PASSWORD=social_content_password -p 3306:3306 -d mysql:8.0"

echo "⏳ Esperando que MySQL esté listo..."
sleep 30

echo "📊 Inicializando base de datos..."
run_remote "docker exec -i social-content-mysql mysql -u root -proot_password social_content_ai < $APP_DIR/backend/database/init.sql"

echo "🔑 Configurando variables de entorno..."
run_remote "cd $APP_DIR && echo 'PORT=3001
NODE_ENV=production
JWT_SECRET=production-secret-key-change-this
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root_password
DB_NAME=social_content_ai
GEMINI_API_KEY=AIzaSyB0XmEE4Hmy8zx2M4yUSHJjdIU35s-nJOw
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://18.191.51.184:3000,http://18.191.51.184:5173,http://18.191.51.184:4173' > backend/.env"

echo "🚀 Iniciando servicios..."
run_remote "cd $APP_DIR/backend && nohup npm start > backend.log 2>&1 &"
run_remote "cd $APP_DIR && nohup npx serve -s dist -l 3000 > frontend.log 2>&1 &"

echo "🔧 Configurando firewall..."
run_remote "sudo ufw allow 22 || true"
run_remote "sudo ufw allow 3000 || true"
run_remote "sudo ufw allow 3001 || true"
run_remote "sudo ufw --force enable || true"

echo "⏳ Esperando que los servicios se inicien..."
sleep 10

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://18.191.51.184:3000"
echo "🔗 Backend: http://18.191.51.184:3001"
echo "📊 Health check: http://18.191.51.184:3001/health"

echo ""
echo "📋 Comandos útiles:"
echo "Ver logs del backend: ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f $APP_DIR/backend/backend.log'"
echo "Ver logs del frontend: ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'tail -f $APP_DIR/frontend.log'"
echo "Ver procesos: ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'ps aux | grep node'"
echo "Ver contenedores: ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'docker ps'"
