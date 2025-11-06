# 🚀 GitHub Codespaces - Guía de Configuración

Esta guía te ayudará a ejecutar el backend de Health Scope en GitHub Codespaces.

## ⚡ Inicio Rápido (3 Pasos)

### 1️⃣ Crear Codespace
- Ve al repositorio en GitHub
- Click **Code** → **Codespaces** → **Create codespace**
- Espera 1-2 minutos (configuración automática)

### 2️⃣ Configurar API Key
```bash
code .env
# Agrega tu GEMINI_API_KEY
```

### 3️⃣ Iniciar Servidor
```bash
npm run codespaces:start
```

**¡Listo!** 🎉 Tu backend está corriendo.

---

## 📋 Requisitos Previos

- Una cuenta de GitHub
- Acceso a GitHub Codespaces
- API Key de Google Gemini ([Obtener aquí](https://makersuite.google.com/app/apikey))

---

## 🎯 Guía Detallada

### 1. Crear el Codespace

1. Ve al repositorio en GitHub
2. Click en **Code** → **Codespaces** → **Create codespace on [branch]**
3. Espera a que el codespace se inicialice (1-2 minutos)

**Lo que sucede automáticamente:**
- ✅ Instala dependencias (`npm install`)
- ✅ Crea archivo `.env` desde `.env.example`
- ✅ Configura HOST=0.0.0.0
- ✅ Configura puertos

### 2. Configurar Variables de Entorno

**El archivo `.env` ya está creado automáticamente.** Solo necesitas editarlo:

```bash
code .env
```

**Variables importantes a configurar:**

```env
# API Key de Gemini (REQUERIDO)
GEMINI_API_KEY=tu-api-key-real

# Frontend URL (actualiza con tu URL de Codespace del frontend)
FRONTEND_URL=https://YOUR-FRONTEND-CODESPACE-3000.app.github.dev
```

### 3. Obtener la URL de tu Codespace

GitHub Codespaces genera URLs automáticas para tus puertos:

**Para el Backend (Puerto 1337):**
1. Ve a la pestaña **PORTS** en la parte inferior de VS Code
2. Busca el puerto `1337`
3. La URL será algo como: `https://your-codespace-name-1337.app.github.dev`
4. Copia esta URL (la necesitarás para el frontend)

**Para el Frontend (Puerto 3000):**
- Si tienes el frontend en otro codespace, obtén su URL del puerto 3000
- Actualiza `FRONTEND_URL` en el `.env` del backend

### 4. Instalar Dependencias (si no se hizo automáticamente)

```bash
npm install
```

### 5. Iniciar el Servidor

```bash
npm run develop
```

### 6. Acceder al Panel de Administración

1. Una vez iniciado, busca en la terminal el mensaje de URL
2. O ve a la pestaña **PORTS** y abre el puerto 1337
3. Agrega `/admin` a la URL: `https://your-codespace-name-1337.app.github.dev/admin`
4. Crea tu cuenta de administrador

---

## 🔧 Configuración Avanzada

### Archivo `backend-urls.config.js`

Este archivo centraliza las URLs del backend. Para usar Codespaces:

```javascript
// 1. Abre backend-urls.config.js
// 2. Cambia ACTIVE_ENVIRONMENT a 'codespaces'
const ACTIVE_ENVIRONMENT = 'codespaces';

// 3. Actualiza la URL de codespaces
const BACKEND_URLS = {
  codespaces: {
    url: 'https://your-actual-codespace-name-1337.app.github.dev',
    description: 'GitHub Codespaces'
  }
};
```

### Archivo `backend-urls.config.json`

Alternativa en JSON:

```json
{
  "activeEnvironment": "codespaces",
  "environments": {
    "codespaces": {
      "url": "https://your-actual-codespace-name-1337.app.github.dev",
      "description": "GitHub Codespaces"
    }
  }
}
```

---

## 🌐 Configuración de CORS

Para que el frontend pueda conectarse al backend:

### Backend (Ya configurado)

El archivo `config/middlewares.ts` usa la variable `FRONTEND_URL`:

```typescript
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
  },
}
```

### Frontend

En tu aplicación frontend, usa la URL del backend de Codespaces:

```javascript
const API_BASE_URL = 'https://your-backend-codespace-1337.app.github.dev';
```

---

## 📝 Visibilidad de Puertos

Por defecto, los puertos en Codespaces son privados. Para hacerlos accesibles:

### Opción 1: Hacer el Puerto Público (Recomendado para desarrollo)

1. Ve a la pestaña **PORTS**
2. Click derecho en el puerto `1337`
3. Selecciona **Port Visibility** → **Public**

### Opción 2: Configurar en `.devcontainer/devcontainer.json`

```json
{
  "portsAttributes": {
    "1337": {
      "label": "Strapi Backend",
      "onAutoForward": "notify",
      "visibility": "public"
    }
  }
}
```

---

## 🔒 Seguridad

### API Keys y Secrets

**NUNCA** subas tu archivo `.env` al repositorio:

1. El archivo `.gitignore` ya incluye `.env`
2. Usa **GitHub Codespaces Secrets** para valores sensibles:
   - Ve a tu repositorio → **Settings** → **Codespaces**
   - Agrega secrets como `GEMINI_API_KEY`
   - Estos se inyectarán automáticamente en el codespace

### Configurar Secrets en Codespaces

```bash
# Los secrets se pueden configurar a nivel de:
# 1. Usuario (todos tus codespaces)
# 2. Repositorio (solo este proyecto)
# 3. Organización (todos los repos de la org)
```

**Agregar un secret:**
1. GitHub → Settings → Codespaces → Secrets
2. Click **New secret**
3. Nombre: `GEMINI_API_KEY`
4. Valor: tu API key
5. El secret estará disponible como variable de entorno

---

## 🐛 Resolución de Problemas

### ❌ Error 404 al acceder al admin

**Causa:** El servidor no está corriendo.

**Solución:**
```bash
# Verificar estado del servidor
npm run codespaces:check

# Si no está corriendo, iniciarlo
npm run codespaces:start
```

### ❌ El servidor no inicia

**Solución:**
```bash
# 1. Verifica las dependencias
npm install

# 2. Limpia caché y archivos temporales
rm -rf .cache build .tmp

# 3. Reinicia
npm run codespaces:start
```

### ❌ Error de CORS

**Causa:** `FRONTEND_URL` no configurada correctamente.

**Solución:**
```bash
# 1. Edita .env
code .env

# 2. Actualiza FRONTEND_URL con la URL correcta
FRONTEND_URL=https://tu-frontend-codespace-3000.app.github.dev

# 3. Reinicia el servidor (Ctrl+C y luego)
npm run codespaces:start
```

### ❌ Puerto 1337 no disponible

```bash
# Verifica qué está usando el puerto
lsof -i :1337

# Si hay un proceso, mátalo
kill -9 $(lsof -ti:1337)

# Reinicia el servidor
npm run codespaces:start
```

### ❌ Puerto 1337 no accesible desde internet

**Causa:** El puerto no es público.

**Solución:**
1. Ve a la pestaña **PORTS**
2. Click derecho en `1337`
3. **Port Visibility** → **Public**

**Nota:** La configuración `.devcontainer/devcontainer.json` ya incluye `"visibility": "public"` pero a veces necesitas hacerlo manualmente.

### ❌ Error: GEMINI_API_KEY not configured

**Causa:** API Key no está configurada en `.env`

**Solución:**
```bash
# Edita .env
code .env

# Agrega tu API key real
GEMINI_API_KEY=tu-api-key-real-aqui
```

### ❌ Base de datos SQLite bloqueada

```bash
# Detén el servidor (Ctrl+C)

# Elimina el archivo de base de datos
rm -rf .tmp/data.db

# Reinicia (se creará una nueva DB)
npm run codespaces:start
```

### 🔍 Verificar Estado General

```bash
# Usa el script de verificación
npm run codespaces:check
```

Este script te dirá:
- ✅ Si el proceso está corriendo
- ✅ Si el puerto está escuchando
- ✅ Si el servidor responde
- ✅ Si es accesible desde internet
- ✅ La URL pública del Codespace

---

## 🔄 Workflow Recomendado

### Desarrollo en Codespaces

**1. Backend Codespace:**
```bash
# Crear codespace (GitHub UI)

# Esperar configuración automática (1-2 min)

# Configurar API Key
code .env
# Agregar GEMINI_API_KEY

# Iniciar servidor
npm run codespaces:start

# Copiar URL del PORTS tab (puerto 1337)
```

**2. Frontend Codespace (si tienes):**
```bash
# Crear codespace del frontend

# Configurar URL del backend
# Usar la URL del paso 1

# Ejecutar frontend
npm run dev  # o el comando que uses

# Copiar URL del PORTS tab (puerto 3000 o el que uses)
```

**3. Actualizar CORS en el Backend:**
```bash
# Volver al backend

# Editar .env
code .env

# Actualizar FRONTEND_URL con la URL del frontend
FRONTEND_URL=https://tu-frontend-codespace-3000.app.github.dev

# Reiniciar servidor (Ctrl+C y luego)
npm run codespaces:start
```

**4. Actualizar backend-urls.config.js:**
```javascript
const ACTIVE_ENVIRONMENT = 'codespaces';

codespaces: {
  url: 'https://tu-backend-codespace-1337.app.github.dev'
}
```

---

## 📊 Monitoreo

### Ver Logs del Servidor

```bash
# Los logs aparecen en la terminal
# Para logs más detallados:
DEBUG=* npm run develop
```

### Ver Base de Datos

```bash
# Instalar cliente SQLite
npm install -g sqlite3

# Conectar a la base de datos
sqlite3 .tmp/data.db

# Comandos útiles:
.tables              # Ver tablas
.schema user_files   # Ver estructura
SELECT * FROM user_files;  # Ver datos
.exit                # Salir
```

---

## 🚀 Deployment a Producción

Cuando estés listo para pasar a producción:

### Opción 1: Strapi Cloud

1. Ve a [Strapi Cloud](https://cloud.strapi.io/)
2. Conecta tu repositorio de GitHub
3. Configura variables de entorno
4. Deploy automático
5. Obtén tu URL: `https://your-project.strapiapp.com`
6. Actualiza `backend-urls.config.js`:

```javascript
const ACTIVE_ENVIRONMENT = 'strapi-cloud';
const BACKEND_URLS = {
  'strapi-cloud': {
    url: 'https://your-project.strapiapp.com',
    description: 'Strapi Cloud Production'
  }
};
```

### Opción 2: Otros Servicios

- **Railway**: Deploy con un click
- **Heroku**: Via git push
- **DigitalOcean App Platform**: Deploy automático
- **AWS/GCP**: Usando Docker

---

## 📚 Recursos Adicionales

- [Documentación de GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Documentación de Strapi](https://docs.strapi.io/)
- [Strapi Cloud Docs](https://docs.strapi.io/cloud/intro)
- [Google Gemini API](https://ai.google.dev/docs)

---

## ✅ Checklist de Configuración

Usa este checklist para asegurarte de que todo está configurado:

- [ ] Codespace creado exitosamente
- [ ] Archivo `.env` configurado con todas las variables
- [ ] `GEMINI_API_KEY` agregada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor iniciado (`npm run develop`)
- [ ] Puerto 1337 visible y accesible
- [ ] URL del backend obtenida desde PORTS
- [ ] Panel admin accesible (`/admin`)
- [ ] Cuenta de administrador creada
- [ ] `FRONTEND_URL` configurada con URL del frontend
- [ ] CORS configurado correctamente
- [ ] `backend-urls.config.js` actualizado con URL de codespace
- [ ] Frontend conectándose exitosamente al backend

---

**¿Problemas?** Consulta la [sección de troubleshooting](#-resolución-de-problemas) o abre un issue en GitHub.
