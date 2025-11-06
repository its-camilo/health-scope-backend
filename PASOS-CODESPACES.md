# 🚀 Pasos EXACTOS para Usar Codespaces

## ⚡ IMPORTANTE

Después de crear el Codespace, el servidor **NO se inicia automáticamente**. Debes seguir estos pasos:

---

## 📝 Paso 1: Crear el Codespace

1. Ve a GitHub → Tu repositorio
2. Click en **Code**
3. Click en **Codespaces**
4. Click en **Create codespace on main** (o tu rama)
5. **ESPERA 2-3 minutos** a que termine la configuración inicial

**Verás un mensaje:** "✅ Configuración completada"

---

## ⚙️ Paso 2: Configurar API Key

En la terminal del Codespace:

```bash
code .env
```

Busca la línea:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Reemplázala con tu API key real:
```env
GEMINI_API_KEY=AIzaSy...tu-api-key-real
```

**Guarda el archivo** (Ctrl+S o Cmd+S)

---

## 🚀 Paso 3: Iniciar el Servidor

En la terminal:

```bash
npm run codespaces:start
```

Verás esto:
```
🚀 Iniciando Health Scope Backend en Codespaces...
=====================================================
✅ Configuración verificada

🔗 URL del Backend: https://improved-space-system-xyz-1337.app.github.dev
🔐 Admin Panel: https://improved-space-system-xyz-1337.app.github.dev/admin
```

**COPIA la URL que aparece en tu terminal.** Esa es la URL correcta de tu Codespace.

⚠️ **IMPORTANTE:** La URL es única para tu Codespace. NO uses URLs de ejemplos.

---

## 🔓 Paso 4: Hacer el Puerto Público

**ESTE PASO ES CRUCIAL:**

1. Ve a la pestaña **PORTS** (parte inferior de VS Code)
2. Busca el puerto `1337`
3. **Click derecho** en el puerto 1337
4. Selecciona **Port Visibility** → **Public**

Verás que el ícono del candado cambia de cerrado 🔒 a abierto 🌐

---

## 🌐 Paso 5: Acceder al Admin Panel

Usa la URL que copiaste en el Paso 3 y agrega `/admin`:

```
https://improved-space-system-xyz-1337.app.github.dev/admin
```

**Reemplaza con TU URL real del Paso 3**

---

## ✅ Paso 6: Verificar Todo

En otra terminal:

```bash
npm run codespaces:verify
```

Este comando:
- ✅ Verifica que el servidor esté corriendo
- ✅ Muestra tu URL del Codespace
- ✅ Verifica acceso desde internet
- ✅ Te dice si algo falta configurar

---

## 🆘 Si Ves Error 404

### Opción 1: El servidor no está corriendo

```bash
# Terminal 1 - Verificar estado
npm run codespaces:check

# Si dice que NO está corriendo:
npm run codespaces:start
```

### Opción 2: El puerto no es público

1. PORTS tab → Puerto 1337
2. Click derecho → Port Visibility → **Public**

### Opción 3: Estás usando URL incorrecta

1. **NO uses URLs de ejemplos o documentación**
2. Usa la URL que aparece cuando ejecutas `npm run codespaces:start`
3. O usa `npm run codespaces:verify` para ver tu URL real

---

## 🔄 Si Necesitas Reiniciar

```bash
# Detén el servidor
Ctrl+C

# Reinicia
npm run codespaces:start
```

---

## 📋 Checklist

- [ ] Codespace creado y configuración terminada
- [ ] GEMINI_API_KEY configurada en `.env`
- [ ] Servidor iniciado con `npm run codespaces:start`
- [ ] URL del backend copiada
- [ ] Puerto 1337 es **Public** en PORTS tab
- [ ] Admin panel accesible en URL/admin
- [ ] Cuenta de admin creada

---

## 🎯 URL Correcta vs Incorrecta

### ❌ INCORRECTO (ejemplo de documentación):
```
https://health-scope-backend-1337.app.github.dev
```

### ✅ CORRECTO (tu Codespace real):
```
https://improved-space-system-x4x479r5wgqh659p-1337.app.github.dev
```

**La URL correcta aparece cuando ejecutas `npm run codespaces:start`**

---

## 🔍 Comandos Útiles

```bash
# Verificar que todo está bien configurado
npm run codespaces:verify

# Ver estado del servidor
npm run codespaces:check

# Iniciar servidor
npm run codespaces:start

# Re-ejecutar setup inicial
npm run codespaces:setup
```

---

## 💡 Resumen

1. **Crear Codespace** → Esperar que termine
2. **Configurar API Key** → `code .env`
3. **Iniciar servidor** → `npm run codespaces:start`
4. **Puerto público** → PORTS tab → Public
5. **Acceder** → URL-del-paso-3/admin

**¡Eso es todo!** 🎉
