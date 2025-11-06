# 🚀 Guía de Deployment - Health Scope Backend

Esta guía cubre cómo desplegar el backend de Health Scope en diferentes entornos.

---

## 📍 Entornos Disponibles

1. **Local** - Desarrollo en tu máquina
2. **GitHub Codespaces** - Desarrollo en la nube
3. **Strapi Cloud** - Producción oficial

---

## 🏠 Entorno Local

### Requisitos
- Node.js >= 18.x
- npm >= 10.x

### Configuración

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd health-scope-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y configura:
# - GEMINI_API_KEY
# - FRONTEND_URL=http://localhost:3000

# 4. Iniciar servidor
npm run develop
```

### URL del Backend
```
http://localhost:1337
```

### Configuración en `backend-urls.config.js`
```javascript
const ACTIVE_ENVIRONMENT = 'local';
```

---

## ☁️ GitHub Codespaces

### Configuración Rápida

**Ver guía completa:** [CODESPACES.md](./CODESPACES.md)

```bash
# 1. Crear codespace desde GitHub
# 2. Configurar .env (se crea automáticamente)
code .env

# 3. Agregar tu GEMINI_API_KEY
# 4. El servidor se inicia automáticamente
```

### URL del Backend
```
https://[tu-codespace-name]-1337.app.github.dev
```

**Obtener la URL:**
1. Ve a la pestaña **PORTS** en VS Code
2. Busca el puerto `1337`
3. Click derecho → **Copy Local Address**

### Hacer el Puerto Público
```bash
# En la pestaña PORTS:
# Click derecho en 1337 → Port Visibility → Public
```

### Configuración en `backend-urls.config.js`
```javascript
const ACTIVE_ENVIRONMENT = 'codespaces';

const BACKEND_URLS = {
  codespaces: {
    url: 'https://your-actual-codespace-1337.app.github.dev',
    description: 'GitHub Codespaces'
  }
};
```

---

## 🌩️ Strapi Cloud (Producción)

### Paso 1: Crear Cuenta en Strapi Cloud

1. Ve a [cloud.strapi.io](https://cloud.strapi.io/)
2. Crea una cuenta o inicia sesión
3. Click en **Create Project**

### Paso 2: Conectar Repositorio

1. Selecciona **GitHub** como source
2. Autoriza a Strapi Cloud
3. Selecciona tu repositorio `health-scope-backend`
4. Selecciona la rama (ej: `main`)

### Paso 3: Configurar Variables de Entorno

En el dashboard de Strapi Cloud, configura:

```env
# Required
GEMINI_API_KEY=tu-api-key-de-gemini
FRONTEND_URL=https://tu-frontend-en-produccion.com

# Database (Strapi Cloud usa PostgreSQL automáticamente)
# No necesitas configurar DATABASE_* en producción

# Node Environment
NODE_ENV=production
```

### Paso 4: Deploy

1. Click en **Deploy**
2. Espera a que el build complete (3-5 minutos)
3. Tu backend estará disponible en: `https://your-project-name.strapiapp.com`

### Paso 5: Configurar Admin

1. Ve a `https://your-project-name.strapiapp.com/admin`
2. Crea tu cuenta de administrador
3. Configura los roles y permisos si es necesario

### Configuración en `backend-urls.config.js`

```javascript
const ACTIVE_ENVIRONMENT = 'strapi-cloud';

const BACKEND_URLS = {
  'strapi-cloud': {
    url: 'https://your-project-name.strapiapp.com',
    description: 'Strapi Cloud Production'
  }
};
```

### Base de Datos en Producción

Strapi Cloud usa PostgreSQL automáticamente:
- No necesitas configurar nada
- Backups automáticos
- Escalable

Si necesitas migrar datos de SQLite a PostgreSQL:

```bash
# 1. Exportar datos de desarrollo
npm run strapi export

# 2. En producción, importar
npm run strapi import
```

---

## 🔐 Configuración de Secrets

### GitHub Codespaces Secrets

**A nivel de usuario:**
1. GitHub → Settings → Codespaces → Secrets
2. New secret → `GEMINI_API_KEY`
3. Aplica a los repositorios que necesites

**A nivel de repositorio:**
1. Tu repo → Settings → Secrets and variables → Codespaces
2. New repository secret
3. Nombre: `GEMINI_API_KEY`

### Strapi Cloud Environment Variables

1. Dashboard → Tu proyecto → Settings → Environment Variables
2. Add Variable:
   - Name: `GEMINI_API_KEY`
   - Value: tu-api-key
3. Save y redeploy

---

## 🌐 Configuración de CORS por Entorno

### Local
```env
FRONTEND_URL=http://localhost:3000
```

### Codespaces
```env
FRONTEND_URL=https://your-frontend-codespace-3000.app.github.dev
```

### Producción (Vercel, Netlify, etc.)
```env
FRONTEND_URL=https://your-app.vercel.app
```

### Múltiples Frontends

Si necesitas permitir varios orígenes, edita `config/middlewares.ts`:

```typescript
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://your-app.vercel.app',
      'https://your-staging.vercel.app'
    ],
    credentials: true,
  },
}
```

---

## 🗃️ Base de Datos por Entorno

### Local / Codespaces: SQLite
```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

**Pros:**
- Fácil setup
- Perfecto para desarrollo
- No requiere servidor externo

**Contras:**
- No escalable
- No recomendado para producción

### Producción: PostgreSQL (Recomendado)

Strapi Cloud usa PostgreSQL automáticamente. Para otros servicios:

```env
DATABASE_CLIENT=postgres
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_NAME=health_scope
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_SSL=true
```

**Proveedores de PostgreSQL:**
- Strapi Cloud (incluido)
- Railway
- Supabase
- Neon
- AWS RDS
- DigitalOcean Managed Databases

---

## 🔄 CI/CD y Automatización

### GitHub Actions para Strapi Cloud

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Strapi Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Strapi Cloud
        run: |
          # Strapi Cloud hace deploy automático
          echo "Deploy triggered on push to main"
```

### Auto-deploy en Strapi Cloud

Por defecto, Strapi Cloud hace deploy automático cuando:
1. Haces push a la rama configurada (ej: `main`)
2. El build pasa exitosamente
3. Los tests (si hay) pasan

---

## 📊 Monitoreo y Logs

### Local / Codespaces

```bash
# Ver logs en tiempo real
npm run develop

# Logs con más detalle
DEBUG=* npm run develop
```

### Strapi Cloud

1. Dashboard → Tu proyecto → Logs
2. Ver logs en tiempo real
3. Filtrar por nivel (error, warn, info)

---

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] `NODE_ENV=production` en producción
- [ ] Secrets en variables de entorno (nunca en código)
- [ ] CORS configurado con dominios específicos
- [ ] HTTPS habilitado (automático en Strapi Cloud)
- [ ] Base de datos con contraseñas fuertes
- [ ] API keys rotadas regularmente
- [ ] Admin panel protegido (cambiar contraseña por defecto)
- [ ] Rate limiting configurado
- [ ] Backups configurados

### Configuraciones Adicionales para Producción

En `config/server.ts`:

```typescript
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Configuración de proxy (si usas Nginx, etc.)
  proxy: env.bool('IS_PROXIED', true),
  // Configuración de rate limiting
  rateLimit: {
    enabled: true,
    max: 100,
    windowMs: 60000,
  },
});
```

---

## 📦 Backup y Recuperación

### Backup de Base de Datos

**SQLite (Local/Codespaces):**
```bash
# Copiar archivo de base de datos
cp .tmp/data.db .tmp/data.db.backup
```

**PostgreSQL (Producción):**
```bash
# Strapi Cloud hace backups automáticos
# Para manual:
pg_dump -h host -U user -d database > backup.sql
```

### Backup de Archivos Subidos

```bash
# Copiar carpeta de uploads
tar -czf uploads-backup.tar.gz public/uploads/
```

### Restauración

**SQLite:**
```bash
cp .tmp/data.db.backup .tmp/data.db
npm run develop
```

**PostgreSQL:**
```bash
psql -h host -U user -d database < backup.sql
```

---

## 🔄 Migración entre Entornos

### De Local a Codespaces

```bash
# 1. Commit y push tu código
git add .
git commit -m "Update for codespaces"
git push

# 2. Crear codespace desde GitHub
# 3. El código se clonará automáticamente
# 4. Configurar .env con los nuevos valores
```

### De Codespaces a Producción

```bash
# 1. Asegurar que todo funciona en codespaces
# 2. Merge a la rama main
git checkout main
git merge tu-rama
git push

# 3. Strapi Cloud detectará el push y desplegará automáticamente
```

---

## 🐛 Troubleshooting por Entorno

### Local

**Error: Port 1337 already in use**
```bash
# Encontrar y matar el proceso
lsof -ti:1337 | xargs kill -9
# O usar otro puerto
PORT=1338 npm run develop
```

**Error: GEMINI_API_KEY not configured**
```bash
# Verificar .env
cat .env | grep GEMINI
# Asegurar que existe y tiene valor
```

### Codespaces

**Error: Cannot access port 1337**
```bash
# Hacer el puerto público
# PORTS tab → 1337 → Right-click → Port Visibility → Public
```

**Error: CORS blocked**
```bash
# Verificar FRONTEND_URL
echo $FRONTEND_URL
# Actualizar en .env y reiniciar
```

### Strapi Cloud

**Build failed**
- Revisar logs en el dashboard
- Verificar que todas las dependencias están en package.json
- Asegurar que NODE_VERSION es compatible

**Database connection error**
- Verificar variables DATABASE_* en environment variables
- Strapi Cloud configura PostgreSQL automáticamente

---

## 📚 Recursos por Entorno

### Local
- [Strapi Documentation](https://docs.strapi.io/)
- [Node.js Documentation](https://nodejs.org/docs/)

### Codespaces
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Codespaces Quick Start](https://docs.github.com/en/codespaces/getting-started/quickstart)

### Strapi Cloud
- [Strapi Cloud Documentation](https://docs.strapi.io/cloud/intro)
- [Strapi Cloud Dashboard](https://cloud.strapi.io/)

---

## ✅ Checklist de Deployment

### Pre-deployment
- [ ] Código funcionando en local
- [ ] Tests pasando (si hay)
- [ ] Variables de entorno documentadas
- [ ] Secrets no en código
- [ ] .gitignore actualizado
- [ ] README actualizado

### Durante Deployment
- [ ] Variables de entorno configuradas
- [ ] Database configurada
- [ ] CORS configurado
- [ ] Build exitoso
- [ ] Servidor iniciado

### Post-deployment
- [ ] Admin panel accesible
- [ ] Cuenta admin creada
- [ ] Endpoints testeados
- [ ] Frontend conectado
- [ ] Logs monitoreados
- [ ] Backups configurados

---

**¿Necesitas ayuda?** Consulta los archivos específicos:
- Local: [README.md](./README.md)
- Codespaces: [CODESPACES.md](./CODESPACES.md)
