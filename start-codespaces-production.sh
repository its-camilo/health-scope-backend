#!/bin/bash

# Script para iniciar el backend en Codespaces en MODO PRODUCCIÓN
# Esto evita las recargas constantes del modo desarrollo

echo "🚀 Iniciando Health Scope Backend en Codespaces (Modo Producción)"
echo "=================================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar si .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Por favor, ejecuta primero el setup:${NC}"
    echo "   npm run codespaces:setup"
    exit 1
fi

# Verificar si GEMINI_API_KEY está configurada
if grep -q "GEMINI_API_KEY=your-gemini-api-key-here" .env || grep -q "GEMINI_API_KEY=$" .env; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: GEMINI_API_KEY no está configurada${NC}"
    echo "El análisis de IA no funcionará sin la API key."
fi

# Verificar que HOST=0.0.0.0
if ! grep -q "HOST=0.0.0.0" .env; then
    echo -e "${YELLOW}⚙️  Configurando HOST=0.0.0.0...${NC}"
    if grep -q "HOST=" .env; then
        sed -i 's/HOST=.*/HOST=0.0.0.0/' .env
    else
        echo "HOST=0.0.0.0" >> .env
    fi
fi

echo ""
echo -e "${GREEN}✅ Configuración verificada${NC}"
echo ""
echo "=================================================================="
echo "🌐 INFORMACIÓN DEL SERVIDOR"
echo "=================================================================="
echo ""

# Obtener la URL del Codespace si está disponible
if [ ! -z "$CODESPACE_NAME" ]; then
    CODESPACE_URL="https://${CODESPACE_NAME}-1337.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo -e "🔗 URL del Backend: ${GREEN}${CODESPACE_URL}${NC}"
    echo -e "🔐 Admin Panel: ${GREEN}${CODESPACE_URL}/admin${NC}"
    echo ""
    echo -e "${YELLOW}📝 Actualiza backend-urls.config.js con esta URL:${NC}"
    echo "   codespaces.url: '${CODESPACE_URL}'"
    echo ""
fi

echo "=================================================================="
echo "🔨 Compilando aplicación..."
echo "=================================================================="
echo ""

# Hacer build de la aplicación
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al compilar la aplicación${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Compilación exitosa${NC}"
echo ""
echo "=================================================================="
echo "🚀 Iniciando servidor en modo PRODUCCIÓN..."
echo "=================================================================="
echo -e "${BLUE}ℹ️  Modo producción: Sin hot-reload, sin recargas automáticas${NC}"
echo ""

# Iniciar servidor en modo producción
npm run start
