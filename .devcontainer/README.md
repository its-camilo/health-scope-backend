# 🚀 GitHub Codespaces - Configuración del Backend

## ✅ Configuración Automática

Al crear el Codespace, se ejecutarán automáticamente:

1. ✅ Instalación de dependencias (`npm install`)
2. ✅ Creación del archivo `.env` desde `.env.example`
3. ✅ Configuración de HOST=0.0.0.0
4. ✅ Apertura de puertos (1337)

## 📋 Pasos Después de Crear el Codespace

### 1. Configurar Variables de Entorno

```bash
# Abre el archivo .env
code .env
```

**Configura estas variables:**

```env
# REQUERIDO: Tu API Key de Gemini
GEMINI_API_KEY=tu-api-key-real-aqui

# Ya configurado por el script de setup
HOST=0.0.0.0
PORT=1337

# Actualiza con la URL de tu frontend (si está en otro codespace)
FRONTEND_URL=https://tu-frontend-codespace-3000.app.github.dev
```

### 2. Iniciar el Servidor

**Opción A: Comando directo**
```bash
npm run develop
```

**Opción B: Script con verificación (Recomendado)**
```bash
npm run codespaces:start
```

Este script:
- ✅ Verifica que `.env` esté configurado
- ✅ Verifica GEMINI_API_KEY
- ✅ Configura HOST=0.0.0.0 automáticamente
- ✅ Muestra la URL del Codespace
- ✅ Inicia el servidor

### 3. Acceder al Admin Panel

**Obtener la URL:**
1. Ve a la pestaña **PORTS** en la parte inferior de VS Code
2. Busca el puerto `1337`
3. Haz click en el ícono del globo 🌐 para abrir la URL
4. Agrega `/admin` al final de la URL

**Ejemplo:**
```
https://automatic-space-adventure-x7v9-1337.app.github.dev/admin
```

### 4. Hacer el Puerto Público (Si no es público)

Si no puedes acceder desde el frontend:

1. Ve a la pestaña **PORTS**
2. Click derecho en el puerto `1337`
3. Selecciona **Port Visibility** → **Public**

## 🔍 Verificar Estado del Servidor

```bash
npm run codespaces:check
```

Este script verifica:
- ✅ Proceso de Strapi corriendo
- ✅ Puerto 1337 escuchando
- ✅ Respuesta HTTP del servidor
- ✅ Acceso externo funcionando
- ✅ Muestra URLs públicas

## 🛠️ Scripts Disponibles

```bash
# Iniciar servidor con verificación
npm run codespaces:start

# Verificar estado del servidor
npm run codespaces:check

# Re-ejecutar setup (si algo falló)
npm run codespaces:setup

# Desarrollo normal
npm run develop

# Build para producción
npm run build
npm run start
```

## 📝 Obtener URL del Codespace

### Desde la Terminal:

```bash
echo "https://${CODESPACE_NAME}-1337.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
```

### Desde la Pestaña PORTS:

1. Click en **PORTS** (parte inferior)
2. Busca `1337 - Strapi Backend`
3. La URL está en la columna **Forwarded Address**

## 🔗 Actualizar URLs en el Frontend

Una vez que tengas la URL del backend:

1. Copia la URL del puerto 1337
2. Ve a `backend-urls.config.js`
3. Actualiza:

```javascript
const ACTIVE_ENVIRONMENT = 'codespaces';

const BACKEND_URLS = {
  codespaces: {
    url: 'https://tu-codespace-real-1337.app.github.dev', // ⬅️ ACTUALIZAR AQUÍ
  }
};
```

## 🐛 Troubleshooting

### Error 404 al acceder al admin

**Causa:** El servidor no está iniciado.

**Solución:**
```bash
# Verifica si el servidor está corriendo
npm run codespaces:check

# Si no está corriendo, inícialo
npm run codespaces:start
```

### Puerto 1337 no accesible externamente

**Causa:** El puerto no es público.

**Solución:**
1. PORTS tab → Click derecho en 1337
2. Port Visibility → **Public**

### CORS Error

**Causa:** FRONTEND_URL no configurada correctamente.

**Solución:**
```bash
# Edita .env
code .env

# Actualiza FRONTEND_URL con la URL de tu frontend
FRONTEND_URL=https://tu-frontend-codespace-3000.app.github.dev
```

### Error: GEMINI_API_KEY not configured

**Causa:** API key no configurada en .env

**Solución:**
```bash
code .env
# Agrega tu API key real
GEMINI_API_KEY=tu-api-key-real
```

### El servidor no inicia

**Solución:**
```bash
# Limpia y reinstala
rm -rf node_modules .tmp build
npm install
npm run develop
```

## 📊 Monitoreo

### Ver Logs en Tiempo Real

Los logs aparecen directamente en la terminal donde ejecutaste `npm run develop`.

### Ver Procesos

```bash
# Ver si Strapi está corriendo
ps aux | grep strapi

# Ver qué está usando el puerto 1337
lsof -i :1337
```

## 🔄 Reiniciar el Codespace

Si algo no funciona:

1. **Reiniciar el servidor:** Ctrl+C en la terminal y `npm run develop`
2. **Rebuild del container:** Command Palette → "Codespaces: Rebuild Container"
3. **Crear nuevo codespace:** Elimina el actual y crea uno nuevo

## ✅ Checklist de Configuración

- [ ] Codespace creado
- [ ] Setup script ejecutado automáticamente
- [ ] Archivo `.env` existe
- [ ] `GEMINI_API_KEY` configurada en `.env`
- [ ] `HOST=0.0.0.0` en `.env`
- [ ] Servidor iniciado con `npm run codespaces:start`
- [ ] Puerto 1337 visible en PORTS tab
- [ ] Puerto 1337 es **Public**
- [ ] Admin panel accesible (URL/admin)
- [ ] URL del backend copiada
- [ ] `backend-urls.config.js` actualizado con URL del codespace
- [ ] `FRONTEND_URL` configurada en `.env` (si tienes frontend)

## 🎯 Flujo Completo

```bash
# 1. Crear codespace (GitHub UI)

# 2. Esperar que setup termine (automático)

# 3. Configurar .env
code .env
# Agregar GEMINI_API_KEY

# 4. Iniciar servidor
npm run codespaces:start

# 5. Obtener URL
# PORTS tab → Puerto 1337 → Copiar URL

# 6. Acceder a admin
# URL-del-codespace/admin

# 7. Crear cuenta de admin (primera vez)

# 8. Actualizar backend-urls.config.js con la URL

# 9. Configurar FRONTEND_URL en .env si tienes frontend

# ¡Listo! 🎉
```

## 🆘 Soporte

Si tienes problemas:
1. Ejecuta `npm run codespaces:check`
2. Revisa los logs en la terminal
3. Consulta [CODESPACES.md](../CODESPACES.md)
4. Verifica que todas las variables de entorno estén configuradas
