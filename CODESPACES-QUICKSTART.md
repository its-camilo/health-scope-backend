# ⚡ Codespaces - Inicio Rápido

## 🚀 3 Pasos para Iniciar

### 1️⃣ Crear Codespace
```
GitHub → Code → Codespaces → Create codespace
```
**Espera 1-2 minutos** (configuración automática)

### 2️⃣ Configurar API Key
```bash
code .env
```
Agrega tu GEMINI_API_KEY:
```env
GEMINI_API_KEY=tu-api-key-real-aqui
```

### 3️⃣ Iniciar Servidor
```bash
npm run codespaces:start
```

## 🌐 Obtener URL del Backend

1. Ve a la pestaña **PORTS** (abajo)
2. Busca puerto `1337`
3. Copia la URL
4. Ejemplo: `https://xyz-1337.app.github.dev`

## 🔐 Acceder al Admin Panel

```
https://tu-codespace-1337.app.github.dev/admin
```

## ✅ Verificar que Todo Funciona

```bash
npm run codespaces:check
```

Este comando verifica:
- ✅ Proceso corriendo
- ✅ Puerto escuchando
- ✅ Servidor respondiendo
- ✅ Accesible desde internet

## 🆘 Problemas Comunes

### Error 404 al acceder
```bash
npm run codespaces:check  # Ver estado
npm run codespaces:start  # Iniciar servidor
```

### Puerto no público
1. PORTS tab
2. Click derecho en 1337
3. Port Visibility → **Public**

### CORS Error
```bash
code .env
# Actualiza FRONTEND_URL con URL de tu frontend
```

## 📚 Documentación Completa

- **Setup detallado:** `.devcontainer/README.md`
- **Guía completa:** `CODESPACES.md`
- **Troubleshooting:** `CODESPACES.md` (sección 🐛)

## 💡 Scripts Útiles

```bash
npm run codespaces:start   # Iniciar con verificación
npm run codespaces:check   # Verificar estado
npm run develop            # Iniciar normal
```

## 🎯 Configuración Automática

Al crear el Codespace, automáticamente:
- ✅ Instala dependencias
- ✅ Crea `.env` desde `.env.example`
- ✅ Configura HOST=0.0.0.0
- ✅ Configura puerto público

**Solo necesitas agregar tu GEMINI_API_KEY y ejecutar el servidor!**

---

**¿Necesitas más ayuda?** Lee `.devcontainer/README.md` o `CODESPACES.md`
