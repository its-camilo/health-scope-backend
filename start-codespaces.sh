#!/bin/bash

# Script para iniciar el backend en Codespaces

echo "🚀 Iniciando Health Scope Backend en Codespaces..."
echo "====================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}Por favor, copia .env.example a .env y configúralo:${NC}"
    echo "   cp .env.example .env"
    echo "   code .env"
    exit 1
fi

# Verificar si GEMINI_API_KEY está configurada
if grep -q "GEMINI_API_KEY=your-gemini-api-key-here" .env || grep -q "GEMINI_API_KEY=$" .env; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: GEMINI_API_KEY no está configurada${NC}"
    echo "El análisis de IA no funcionará sin la API key."
    echo ""
    read -p "¿Deseas continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Configuración cancelada. Edita .env y configura GEMINI_API_KEY"
        exit 1
    fi
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
echo "====================================================="
echo "🌐 INFORMACIÓN DEL SERVIDOR"
echo "====================================================="
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

echo "====================================================="
echo "🚀 Iniciando servidor Strapi..."
echo "====================================================="
echo ""

# Iniciar servidor
npm run develop
