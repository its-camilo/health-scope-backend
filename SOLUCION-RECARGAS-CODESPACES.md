# 🔧 Solución: Recargas Constantes en Codespaces

## 🐛 Problema

Al usar `npm run develop` en Codespaces, el admin panel se recarga constantemente, haciendo imposible usarlo.

**Causa:** El modo `develop` tiene hot-reload activado que detecta cambios constantemente en el sistema de archivos de Codespaces.

---

## ✅ Solución

Usa el **modo producción** en Codespaces en lugar del modo desarrollo.

---

## 🚀 Pasos para Solucionar

### 1. Detén el servidor actual
```bash
# Presiona Ctrl+C en la terminal donde está corriendo
```

### 2. Inicia en modo producción
```bash
npm run codespaces:start
```

Este comando:
- ✅ Compila la aplicación (`npm run build`)
- ✅ Inicia en modo producción (`npm run start`)
- ✅ **SIN hot-reload** → Sin recargas constantes

---

## 📝 Comandos Actualizados

### Para Codespaces (Recomendado)
```bash
npm run codespaces:start     # Modo producción (sin recargas)
```

### Solo si necesitas desarrollo con hot-reload
```bash
npm run codespaces:dev       # Modo desarrollo (con recargas)
```

**Nota:** En Codespaces, se recomienda usar siempre modo producción.

---

## 🔄 ¿Qué Cambia?

| Característica | Modo Desarrollo | Modo Producción |
|----------------|-----------------|-----------------|
| Hot-reload | ✅ Sí | ❌ No |
| Recargas automáticas | ✅ Sí | ❌ No |
| Performance | Más lento | Más rápido |
| Recomendado para | Local | Codespaces |

---

## ⚙️ ¿Cómo Aplicar Cambios en Producción?

Si haces cambios en el código en modo producción:

```bash
# 1. Detén el servidor (Ctrl+C)

# 2. Reconstruye y reinicia
npm run codespaces:start
```

---

## 💡 Alternativa Rápida

Si ya tienes el servidor corriendo y no quieres esperar el build:

### En tu terminal actual
```bash
# 1. Detén el servidor (Ctrl+C)

# 2. Inicia directo en modo producción
npm run start
```

**Nota:** Esto solo funciona si ya hiciste `npm run build` antes.

---

## 🎯 Resumen

**ANTES (con recargas):**
```bash
npm run codespaces:start    # Usaba develop
# ❌ Recargas constantes
```

**AHORA (sin recargas):**
```bash
npm run codespaces:start    # Usa producción
# ✅ Sin recargas
```

---

## ✅ Verificar que Funciona

Después de iniciar en modo producción:

1. Accede al admin panel
2. Navega por diferentes secciones
3. **No debería recargarse automáticamente**
4. Puedes trabajar normalmente

---

## 📋 Checklist

- [ ] Servidor detenido (Ctrl+C)
- [ ] Ejecutado `npm run codespaces:start`
- [ ] Build completado sin errores
- [ ] Servidor iniciado en modo producción
- [ ] Admin panel accesible
- [ ] **NO hay recargas constantes**

---

**¡Problema resuelto!** 🎉

Ahora puedes usar Strapi en Codespaces sin interrupciones.
