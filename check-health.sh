#!/bin/bash

# Script para verificar el estado del backend

echo "🔍 Verificando estado del servidor..."
echo "====================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si el proceso está corriendo
if pgrep -f "strapi" > /dev/null; then
    echo -e "${GREEN}✅ Proceso de Strapi está corriendo${NC}"
else
    echo -e "${RED}❌ Proceso de Strapi NO está corriendo${NC}"
    echo "Para iniciar el servidor, ejecuta: npm run develop"
    exit 1
fi

# Verificar si el puerto 1337 está escuchando
if lsof -Pi :1337 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Puerto 1337 está escuchando${NC}"
else
    echo -e "${RED}❌ Puerto 1337 NO está escuchando${NC}"
    exit 1
fi

# Verificar conexión HTTP
echo ""
echo "Verificando endpoint de salud..."

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/_health 2>/dev/null)

if [ "$RESPONSE" = "204" ] || [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Servidor respondiendo correctamente (HTTP $RESPONSE)${NC}"
else
    echo -e "${YELLOW}⚠️  Servidor responde con código: $RESPONSE${NC}"
fi

# Información del Codespace
if [ ! -z "$CODESPACE_NAME" ]; then
    echo ""
    echo "====================================================="
    echo "🌐 INFORMACIÓN DE CODESPACES"
    echo "====================================================="
    CODESPACE_URL="https://${CODESPACE_NAME}-1337.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo -e "🔗 URL Pública: ${GREEN}${CODESPACE_URL}${NC}"
    echo -e "🔐 Admin Panel: ${GREEN}${CODESPACE_URL}/admin${NC}"
    echo ""

    # Verificar acceso externo
    echo "Verificando acceso externo..."
    EXT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${CODESPACE_URL}/_health 2>/dev/null)

    if [ "$EXT_RESPONSE" = "204" ] || [ "$EXT_RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Accesible desde internet${NC}"
    else
        echo -e "${YELLOW}⚠️  Verifica que el puerto 1337 sea público${NC}"
        echo "   1. Ve a la pestaña PORTS"
        echo "   2. Click derecho en 1337"
        echo "   3. Port Visibility → Public"
    fi
fi

echo ""
echo "====================================================="
echo -e "${GREEN}✅ Verificación completada${NC}"
echo "====================================================="
