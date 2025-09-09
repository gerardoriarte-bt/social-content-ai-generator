#!/bin/bash

# Script de despliegue simple para EC2 Ubuntu
set -e

EC2_HOST="18.191.51.184"
EC2_USER="ubuntu"
PEM_FILE="/Users/buentipo/Downloads/social_contentbt.pem"
APP_DIR="/home/ubuntu/social-content-ai-generator"

echo "🚀 Despliegue simple en EC2 Ubuntu..."

run_remote() {
    echo "🔧 $1"
    ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$1"
}

echo "📦 Instalando dependencias básicas..."
run_remote "sudo apt update && sudo apt install -y git"

echo "🔧 Instalando Node.js..."
run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
run_remote "sudo apt-get install -y nodejs"

echo "🐳 Instalando Docker sin conflictos..."
run_remote "sudo apt-get remove -y containerd.io || true"
run_remote "sudo apt-get install -y docker.io"
run_remote "sudo systemctl start docker && sudo systemctl enable docker"
run_remote "sudo usermod -a -G docker ubuntu"

echo "📁 Preparando directorio..."
run_remote "rm -rf $APP_DIR && mkdir -p $APP_DIR"

echo "📤 Copiando archivos..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no package.json "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no package-lock.json "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no vite.config.ts "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no tsconfig.json "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no index.html "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no index.tsx "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no App.tsx "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no types.ts "$EC2_USER@$EC2_HOST:$APP_DIR/"

echo "📤 Copiando directorios..."
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r components "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r services "$EC2_USER@$EC2_HOST:$APP_DIR/"
scp -i "$PEM_FILE" -o StrictHostKeyChecking=no -r backend "$EC2_USER@$EC2_HOST:$APP_DIR/"

echo "🔧 Instalando dependencias..."
run_remote "cd $APP_DIR && npm install"
run_remote "cd $APP_DIR/backend && npm install"

echo "🏗️ Construyendo frontend..."
run_remote "cd $APP_DIR && npm run build"

echo "🗄️ Iniciando MySQL..."
run_remote "docker stop social-content-mysql || true"
run_remote "docker rm social-content-mysql || true"
run_remote "docker run --name social-content-mysql -e MYSQL_ROOT_PASSWORD=root_password -e MYSQL_DATABASE=social_content_ai -e MYSQL_USER=social_content_user -e MYSQL_PASSWORD=social_content_password -p 3306:3306 -d mysql:8.0"

echo "⏳ Esperando MySQL..."
sleep 30

echo "📊 Inicializando BD..."
run_remote "docker exec -i social-content-mysql mysql -u root -proot_password social_content_ai < $APP_DIR/backend/database/init.sql"

echo "🔑 Configurando .env..."
run_remote "cd $APP_DIR && cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=production
JWT_SECRET=production-secret-key
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root_password
DB_NAME=social_content_ai
GEMINI_API_KEY=AIzaSyB0XmEE4Hmy8zx2M4yUSHJjdIU35s-nJOw
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://18.191.51.184:3000,http://18.191.51.184:5173,http://18.191.51.184:4173
EOF"

echo "🚀 Iniciando servicios..."
run_remote "cd $APP_DIR/backend && nohup npm start > backend.log 2>&1 &"
run_remote "cd $APP_DIR && nohup npx serve -s dist -l 3000 > frontend.log 2>&1 &"

echo "🔧 Configurando firewall..."
run_remote "sudo ufw allow 22 && sudo ufw allow 3000 && sudo ufw allow 3001 && sudo ufw --force enable"

echo "⏳ Esperando servicios..."
sleep 10

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://18.191.51.184:3000"
echo "🔗 Backend: http://18.191.51.184:3001"
echo "📊 Health: http://18.191.51.184:3001/health"
