#!/bin/bash

echo "🔄 Ejecutando migraciones de base de datos..."

# Verificar que MySQL esté corriendo
if ! docker-compose -f docker-compose.dev.yml ps mysql-dev | grep -q "Up"; then
    echo "❌ MySQL no está corriendo. Iniciando servicios..."
    docker-compose -f docker-compose.dev.yml up -d mysql-dev
    echo "⏳ Esperando que MySQL esté listo..."
    sleep 10
fi

# Ejecutar migración para agregar columna platform
echo "📝 Agregando columna 'platform' a content_ideas..."
docker-compose -f docker-compose.dev.yml exec mysql-dev mysql -u social_content_user -psocial_content_password social_content_ai -e "
ALTER TABLE content_ideas 
ADD COLUMN IF NOT EXISTS platform VARCHAR(100) NOT NULL DEFAULT 'Instagram';
"

# Agregar índice si no existe
echo "📊 Agregando índice para platform..."
docker-compose -f docker-compose.dev.yml exec mysql-dev mysql -u social_content_user -psocial_content_password social_content_ai -e "
CREATE INDEX IF NOT EXISTS idx_platform ON content_ideas(platform);
"

echo "✅ Migraciones completadas exitosamente!"
echo "🔄 Reiniciando backend..."
docker-compose -f docker-compose.dev.yml restart backend-dev

echo "🎉 ¡Listo! La aplicación debería funcionar correctamente ahora."
