#!/bin/bash

echo "🚀 Health Scope Backend - Configuración de Codespaces"
echo "====================================================="

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencias instaladas correctamente${NC}"
else
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

# Verificar si existe .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Creando archivo .env desde .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edita .env y configura GEMINI_API_KEY${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Verificar configuración de HOST
if grep -q "HOST=0.0.0.0" .env; then
    echo -e "${GREEN}✅ HOST configurado correctamente para Codespaces${NC}"
else
    echo -e "${YELLOW}⚙️  Configurando HOST=0.0.0.0 en .env...${NC}"
    if grep -q "HOST=" .env; then
        sed -i 's/HOST=.*/HOST=0.0.0.0/' .env
    else
        echo "HOST=0.0.0.0" >> .env
    fi
    echo -e "${GREEN}✅ HOST configurado${NC}"
fi

# Crear directorio de datos si no existe
mkdir -p .tmp

echo ""
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "====================================================="
echo "📋 PRÓXIMOS PASOS:"
echo "====================================================="
echo ""
echo "1. Configura tu GEMINI_API_KEY en el archivo .env:"
echo -e "   ${YELLOW}code .env${NC}"
echo ""
echo "2. Inicia el servidor:"
echo -e "   ${YELLOW}npm run develop${NC}"
echo ""
echo "3. Accede al admin panel:"
echo "   - Ve a la pestaña PORTS"
echo "   - Busca el puerto 1337"
echo "   - Click en el globo para abrir"
echo "   - Agrega /admin a la URL"
echo ""
echo "====================================================="
