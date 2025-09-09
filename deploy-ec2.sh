#!/bin/bash

# Script de despliegue para EC2
# Configuración
EC2_HOST="18.191.51.184"
EC2_USER="ec2-user"
PEM_FILE="/Users/buentipo/Downloads/social_contentbt.pem"
APP_NAME="social-content-ai-generator"
APP_DIR="/home/ec2-user/$APP_NAME"

echo "🚀 Iniciando despliegue en EC2..."

# Función para ejecutar comandos en EC2
run_remote() {
    ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$1"
}

# Función para copiar archivos a EC2
copy_to_remote() {
    scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r "$1" "$EC2_USER@$EC2_HOST:$2"
}

echo "📦 Actualizando sistema y instalando dependencias..."
run_remote "sudo yum update -y"
run_remote "sudo yum install -y git nodejs npm docker"

echo "🐳 Iniciando Docker..."
run_remote "sudo systemctl start docker"
run_remote "sudo systemctl enable docker"
run_remote "sudo usermod -a -G docker ec2-user"

echo "📁 Preparando directorio de la aplicación..."
run_remote "rm -rf $APP_DIR"
run_remote "mkdir -p $APP_DIR"

echo "📤 Copiando archivos de la aplicación..."
copy_to_remote "." "$APP_DIR/"

echo "🔧 Configurando la aplicación..."
run_remote "cd $APP_DIR && npm install"
run_remote "cd $APP_DIR/backend && npm install"

echo "🗄️ Configurando base de datos MySQL..."
run_remote "cd $APP_DIR && docker run --name social-content-mysql -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=social_content_ai -e MYSQL_USER=social_content_user -e MYSQL_PASSWORD=social_content_password -p 3306:3306 -d mysql:8.0"

echo "⏳ Esperando que MySQL esté listo..."
sleep 30

echo "📊 Inicializando base de datos..."
run_remote "cd $APP_DIR && docker exec -i social-content-mysql mysql -u root -proot_password social_content_ai < backend/database/init.sql"

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

echo "🏗️ Construyendo aplicación frontend..."
run_remote "cd $APP_DIR && npm run build"

echo "🚀 Iniciando servicios..."
run_remote "cd $APP_DIR/backend && nohup npm start > backend.log 2>&1 &"
run_remote "cd $APP_DIR && nohup npx serve -s dist -l 3000 > frontend.log 2>&1 &"

echo "🔧 Configurando firewall..."
run_remote "sudo ufw allow 22"
run_remote "sudo ufw allow 3000"
run_remote "sudo ufw allow 3001"
run_remote "sudo ufw --force enable"

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://18.191.51.184:3000"
echo "🔗 Backend: http://18.191.51.184:3001"
echo "📊 Health check: http://18.191.51.184:3001/health"

echo "📋 Para verificar el estado de los servicios:"
echo "ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'ps aux | grep node'"
echo "ssh -i $PEM_FILE $EC2_USER@$EC2_HOST 'docker ps'"
