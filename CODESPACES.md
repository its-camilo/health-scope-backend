# 🚀 GitHub Codespaces - Guía de Configuración

Esta guía te ayudará a ejecutar el backend de Health Scope en GitHub Codespaces.

## 📋 Requisitos Previos

- Una cuenta de GitHub
- Acceso a GitHub Codespaces
- API Key de Google Gemini ([Obtener aquí](https://makersuite.google.com/app/apikey))

---

## 🎯 Inicio Rápido

### 1. Crear el Codespace

1. Ve al repositorio en GitHub
2. Click en **Code** → **Codespaces** → **Create codespace on [branch]**
3. Espera a que el codespace se inicialice (1-2 minutos)

### 2. Configurar Variables de Entorno

El codespace se creará automáticamente, pero necesitas configurar las variables de entorno:

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env

# 2. Edita el archivo .env
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

### El servidor no inicia

```bash
# Verifica las dependencias
npm install

# Limpia caché
npm run build
rm -rf .cache build

# Reinicia
npm run develop
```

### Error de CORS

```bash
# 1. Verifica FRONTEND_URL en .env
echo $FRONTEND_URL

# 2. Asegúrate de que coincide con la URL del frontend
# 3. Reinicia el servidor
```

### Puerto 1337 no disponible

```bash
# Verifica qué está usando el puerto
lsof -i :1337

# O usa otro puerto
PORT=1338 npm run develop
```

### Base de datos SQLite bloqueada

```bash
# Detén el servidor
# Elimina el archivo de base de datos
rm -rf .tmp/data.db

# Reinicia (se creará una nueva DB)
npm run develop
```

---

## 🔄 Workflow Recomendado

### Desarrollo en Codespaces

1. **Backend Codespace:**
   - Clona el repositorio del backend
   - Crea codespace
   - Configura `.env` con tu API key
   - Ejecuta `npm run develop`
   - Copia la URL del puerto 1337

2. **Frontend Codespace:**
   - Clona el repositorio del frontend
   - Crea codespace
   - Configura la URL del backend (del paso 1)
   - Ejecuta el frontend
   - Copia la URL del puerto 3000

3. **Actualizar CORS:**
   - Vuelve al backend
   - Actualiza `FRONTEND_URL` en `.env` con la URL del frontend
   - Reinicia el backend

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
