#!/bin/bash

# Script para asegurar que el puerto esté público en Codespaces

echo "🔍 Verificando configuración de puertos en Codespaces..."
echo "============================================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar si estamos en Codespaces
if [ -z "$CODESPACE_NAME" ]; then
    echo -e "${RED}❌ No estás en un Codespace${NC}"
    echo "Este script solo funciona en GitHub Codespaces."
    exit 1
fi

# Construir la URL del Codespace
CODESPACE_URL="https://${CODESPACE_NAME}-1337.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

echo ""
echo -e "${BLUE}📍 Información del Codespace:${NC}"
echo -e "   Nombre: ${CODESPACE_NAME}"
echo -e "   URL Backend: ${GREEN}${CODESPACE_URL}${NC}"
echo -e "   Admin Panel: ${GREEN}${CODESPACE_URL}/admin${NC}"
echo ""

# Verificar si el servidor está corriendo
if lsof -Pi :1337 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Servidor corriendo en puerto 1337${NC}"
else
    echo -e "${YELLOW}⚠️  Servidor NO está corriendo en puerto 1337${NC}"
    echo "   Inicia el servidor con: npm run codespaces:start"
fi

echo ""
echo "============================================================"
echo -e "${YELLOW}📋 PASOS IMPORTANTES:${NC}"
echo "============================================================"
echo ""
echo "1️⃣  Hacer el puerto PÚBLICO:"
echo "   - Ve a la pestaña 'PORTS' (parte inferior de VS Code)"
echo "   - Busca el puerto '1337'"
echo "   - Click derecho → 'Port Visibility' → 'Public'"
echo ""
echo "2️⃣  Acceder al admin panel:"
echo -e "   ${GREEN}${CODESPACE_URL}/admin${NC}"
echo ""
echo "3️⃣  Actualizar backend-urls.config.js:"
echo "   const ACTIVE_ENVIRONMENT = 'codespaces';"
echo "   codespaces: {"
echo "     url: '${CODESPACE_URL}'"
echo "   }"
echo ""
echo "============================================================"

# Intentar hacer una petición al servidor
echo ""
echo "🔍 Verificando acceso al servidor..."

if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${CODESPACE_URL}/_health 2>/dev/null || echo "000")

    if [ "$RESPONSE" = "204" ] || [ "$RESPONSE" = "200" ]; then
        echo -e "${GREEN}✅ Servidor accesible desde internet (HTTP $RESPONSE)${NC}"
        echo ""
        echo -e "${GREEN}🎉 ¡Todo está configurado correctamente!${NC}"
        echo -e "   Puedes acceder a: ${GREEN}${CODESPACE_URL}/admin${NC}"
    else
        echo -e "${YELLOW}⚠️  No se puede acceder externamente (HTTP $RESPONSE)${NC}"
        echo ""
        echo -e "${RED}Por favor, asegúrate de:${NC}"
        echo "   1. El servidor está corriendo (npm run codespaces:start)"
        echo "   2. El puerto 1337 es PÚBLICO (PORTS tab → Port Visibility → Public)"
    fi
else
    echo -e "${YELLOW}⚠️  curl no disponible, no se puede verificar acceso externo${NC}"
fi

echo ""
echo "============================================================"
