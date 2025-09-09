#!/bin/bash

# Script para verificar el despliegue en EC2
EC2_HOST="18.191.51.184"
EC2_USER="ec2-user"
PEM_FILE="/Users/buentipo/Downloads/social_contentbt.pem"
APP_DIR="/home/ec2-user/social-content-ai-generator"

echo "🔍 Verificando despliegue en EC2..."

# Función para ejecutar comandos en EC2
run_remote() {
    ssh -i "$PEM_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "$1"
}

echo "📊 Estado de los servicios:"
run_remote "ps aux | grep node | grep -v grep"

echo ""
echo "🐳 Estado de Docker:"
run_remote "docker ps"

echo ""
echo "🌐 Verificando conectividad:"
echo "Frontend (puerto 3000):"
curl -s -o /dev/null -w "%{http_code}" http://18.191.51.184:3000 || echo "No disponible"

echo ""
echo "Backend (puerto 3001):"
curl -s -o /dev/null -w "%{http_code}" http://18.191.51.184:3001/health || echo "No disponible"

echo ""
echo "📋 Logs del backend:"
run_remote "tail -20 $APP_DIR/backend/backend.log"

echo ""
echo "📋 Logs del frontend:"
run_remote "tail -20 $APP_DIR/frontend.log"
