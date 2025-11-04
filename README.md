# Health Scope Backend

Backend completo en Strapi v5 para la aplicación web "Health Scope". Este backend gestiona la autenticación de usuarios, el almacenamiento de archivos médicos (fotos y PDFs), y la generación de análisis de salud basados en IA.

## 📋 Características

- ✅ Autenticación de usuarios con JWT
- ✅ Gestión de archivos médicos (fotos y PDFs)
- ✅ Análisis de salud con IA (Google Gemini)
- ✅ CORS configurado para frontend específico
- ✅ Políticas de propietario para seguridad de datos
- ✅ Base de datos SQLite para desarrollo rápido

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.x
- npm >= 10.x

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

Edita el archivo `.env` y configura:

```env
# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000

# Gemini API Key (obtener de https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=tu-api-key-de-gemini
```

3. **Iniciar el servidor de desarrollo:**
```bash
npm run develop
```

El servidor estará disponible en `http://localhost:1337`

4. **Crear usuario administrador:**

En el primer inicio, accede a `http://localhost:1337/admin` y crea tu cuenta de administrador.

## 📁 Estructura del Proyecto

```
health-scope-backend/
├── config/
│   ├── middlewares.ts         # Configuración de CORS
│   ├── plugins.ts              # Configuración de users-permissions
│   └── ...
├── src/
│   ├── api/
│   │   ├── user-file/          # API de archivos médicos
│   │   │   ├── content-types/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── routes/
│   │   ├── analysis-result/    # API de resultados de análisis
│   │   │   ├── content-types/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   └── routes/
│   │   └── analysis/           # API personalizada de análisis
│   │       ├── controllers/
│   │       ├── services/
│   │       └── routes/
│   └── index.ts                # Bootstrap y configuración de permisos
├── .env                        # Variables de entorno
└── package.json
```

## 🔌 API Endpoints

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Obtener Usuario Actual
```http
GET /api/users/me
Authorization: Bearer {jwt}
```

### Gestión de Archivos Médicos

#### Subir Archivo
```http
POST /api/user-files
Authorization: Bearer {jwt}
Content-Type: multipart/form-data

data: {
  "file_name": "analisis_sangre.pdf",
  "file_type": "pdf"
}
files: {
  "file_data": [archivo]
}
```

#### Listar Archivos del Usuario
```http
GET /api/user-files
Authorization: Bearer {jwt}
```

Respuesta:
```json
{
  "data": [
    {
      "id": 1,
      "file_name": "analisis_sangre.pdf",
      "file_type": "pdf",
      "file_data": {
        "url": "/uploads/analisis_sangre_123.pdf",
        "mime": "application/pdf"
      }
    }
  ]
}
```

#### Eliminar Archivo
```http
DELETE /api/user-files/:id
Authorization: Bearer {jwt}
```

### Análisis de Salud

#### Ejecutar Análisis
```http
POST /api/analysis/run
Authorization: Bearer {jwt}
```

Este endpoint:
1. Obtiene todos los archivos del usuario
2. Procesa las imágenes y PDFs
3. Envía los datos a Google Gemini
4. Guarda/actualiza el resultado del análisis
5. Retorna el análisis

Respuesta:
```json
{
  "data": {
    "id": 1,
    "analysis_data": {
      "healthScore": 85,
      "alopeciaRisk": "low",
      "generalHealthMetricsSummary": "Los resultados muestran niveles saludables..."
    }
  },
  "message": "Analysis completed successfully"
}
```

#### Restablecer Datos
```http
POST /api/analysis/reset
Authorization: Bearer {jwt}
```

Este endpoint:
1. Elimina todos los archivos del usuario
2. Elimina el resultado de análisis del usuario
3. Retorna confirmación

Respuesta:
```json
{
  "message": "All data has been reset successfully",
  "deletedFiles": 3,
  "deletedAnalysis": 1
}
```

#### Obtener Resultados de Análisis
```http
GET /api/analysis-results
Authorization: Bearer {jwt}
```

## 🔒 Seguridad y Políticas de Propietario

El backend implementa políticas de propietario que garantizan que:

1. **User Files**:
   - Los usuarios solo pueden ver, crear y eliminar sus propios archivos
   - La relación usuario-archivo se establece automáticamente al crear
   - No se permite acceso a archivos de otros usuarios

2. **Analysis Results**:
   - Los usuarios solo pueden ver sus propios resultados
   - Los resultados se crean/actualizan automáticamente al ejecutar análisis
   - Un usuario solo tiene un resultado (se actualiza en cada análisis)

3. **Implementación**:
   - Los controladores verifican el `ctx.state.user.id`
   - Se aplican filtros automáticos en las consultas
   - Se valida la propiedad antes de operaciones de modificación/eliminación

## 🔑 Configuración de Permisos

Los permisos se configuran automáticamente en el bootstrap (`src/index.ts`):

### Rol Public (No autenticado)
- ✅ `auth.register` - Registro de usuarios
- ✅ `auth.callback` - Callback de autenticación

### Rol Authenticated (Autenticado)
- ✅ `user.me` - Obtener datos del usuario actual
- ✅ `upload.upload` - Subir archivos
- ✅ `user-file.find` - Listar archivos propios
- ✅ `user-file.create` - Crear archivos
- ✅ `user-file.delete` - Eliminar archivos propios
- ✅ `analysis-result.find` - Listar resultados propios
- ✅ `analysis-result.findOne` - Obtener resultado específico
- ✅ `analysis.run` - Ejecutar análisis
- ✅ `analysis.reset` - Restablecer datos

## 🎨 Modelos de Datos

### User (users-permissions)
```typescript
{
  username: string    // Required
  email: string       // Required, Unique
  password: string    // Required
}
```

### User File
```typescript
{
  file_data: Media         // Required, Single file
  file_name: string        // Required
  file_type: enum          // Required: 'photo' | 'pdf'
  user: Relation           // Required, Many-to-One
}
```

### Analysis Result
```typescript
{
  analysis_data: JSON      // Required
  user: Relation           // Required, One-to-One, Unique
}
```

Estructura de `analysis_data`:
```typescript
{
  healthScore: number                    // 0-100
  alopeciaRisk: 'low' | 'medium' | 'high'
  generalHealthMetricsSummary: string
}
```

## 🌐 Configuración de CORS

El CORS está configurado en `config/middlewares.ts` para permitir peticiones únicamente desde:
- La URL definida en `FRONTEND_URL` (`.env`)
- Por defecto: `http://localhost:3000`

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

## 🤖 Integración con Google Gemini

El servicio de análisis utiliza la API de Google Gemini para procesar archivos médicos:

1. **Modelo**: `gemini-1.5-flash`
2. **Procesamiento**:
   - Imágenes: Convertidas a base64 e incluidas en la petición
   - PDFs: Ruta almacenada para procesamiento futuro
3. **Prompt**: Solicita análisis estructurado en JSON
4. **Respuesta**: Parseada y almacenada en `analysis_data`

## 📝 Configuración Adicional

### Desactivar Confirmación por Email

La confirmación por email está desactivada en `config/plugins.ts`:

```typescript
'users-permissions': {
  config: {
    email: {
      confirmation: {
        enabled: false
      }
    }
  }
}
```

### Base de Datos

Por defecto usa SQLite (`config/database.ts`):
- Archivo: `.tmp/data.db`
- Ideal para desarrollo
- Para producción, considera PostgreSQL o MySQL

## 🛠️ Comandos Útiles

```bash
# Desarrollo con recarga automática
npm run develop

# Producción
npm run build
npm run start

# Ver todos los comandos
npm run strapi
```

## 📦 Dependencias Principales

- **@strapi/strapi** ^5.30.0 - Framework backend
- **@strapi/plugin-users-permissions** - Autenticación y autorización
- **better-sqlite3** - Base de datos SQLite

## 🔍 Verificación de la Configuración

Para verificar que todo está configurado correctamente:

1. ✅ Variables de entorno en `.env` configuradas
2. ✅ CORS permite peticiones desde `FRONTEND_URL`
3. ✅ Permisos configurados automáticamente en bootstrap
4. ✅ Políticas de propietario implementadas en controladores
5. ✅ API Key de Gemini configurada

## 🚨 Notas Importantes

1. **API Key de Gemini**: Es necesaria para ejecutar análisis. Obtener en [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **Archivos Subidos**: Se almacenan en `/public/uploads/`. En producción, considera usar un servicio de almacenamiento en la nube.

3. **SQLite**: Adecuado solo para desarrollo. En producción, migra a PostgreSQL o MySQL.

4. **Seguridad**: El JWT se incluye en el header `Authorization: Bearer {token}`

## 📄 Licencia

Este proyecto es parte de Health Scope y está configurado para uso educativo y de desarrollo.

## 🤝 Soporte

Para problemas o preguntas sobre la configuración, consulta la [documentación oficial de Strapi](https://docs.strapi.io/).
