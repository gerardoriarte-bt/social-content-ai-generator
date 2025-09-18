#!/bin/bash

echo "🔧 Configuración de Variables de Entorno"
echo "========================================"

# Verificar si .env existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp env.example .env
fi

echo "📋 Configuración actual:"
echo "GEMINI_API_KEY: $(grep GEMINI_API_KEY .env | cut -d'=' -f2)"

echo ""
echo "🔑 Para obtener tu API Key de Gemini:"
echo "1. Ve a: https://makersuite.google.com/app/apikey"
echo "2. Crea una nueva API key"
echo "3. Copia la key"
echo ""

read -p "¿Tienes tu API key de Gemini? (y/n): " has_key

if [ "$has_key" = "y" ] || [ "$has_key" = "Y" ]; then
    read -p "Pega tu API key aquí: " api_key
    
    if [ ! -z "$api_key" ]; then
        # Actualizar el archivo .env
        sed -i.bak "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$api_key/" .env
        echo "✅ API key configurada correctamente"
        
        # Reiniciar servicios Docker
        echo "🔄 Reiniciando servicios Docker..."
        docker-compose -f docker-compose.dev.yml restart
        
        echo "🎉 Configuración completada!"
        echo "La aplicación debería funcionar correctamente ahora."
    else
        echo "❌ No se proporcionó una API key válida"
    fi
else
    echo "⚠️  Necesitas una API key de Gemini para que la aplicación funcione completamente"
    echo "Puedes obtenerla en: https://makersuite.google.com/app/apikey"
    echo "Después ejecuta este script nuevamente."
fi
