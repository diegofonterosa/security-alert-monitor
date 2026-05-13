# Revisión de Seguridad - Mini-SIEM

## ✅ ASPECTOS POSITIVOS ENCONTRADOS

1. **Helmet.js correctamente configurado** - CSP, HSTS activos
2. **CORS restrictivo** - Origin validado según entorno
3. **Rate limiting** - Implementado general (100/15min) y anti-bruteforce en login (10/15min)
4. **Validación con express-validator** - Sanitización de inputs
5. **Escapado de HTML en frontend** - Prevención de XSS
6. **Token JWT seguro** - Uso de Bearer + jsonwebtoken
7. **sessionStorage en lugar de localStorage** - Mejor para tokens
8. **Índices en MongoDB** - Optimizados para consultas frecuentes
9. **Enum validation** en schemas
10. **Whitelist de campos** en POST para evitar mass assignment

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. JWT_SECRET con valor por defecto débil
**Archivo:** `backend/middleware/auth.js:4`
**Problema:** Si `JWT_SECRET` no está en `.env`, usa `'tu-secreto-jwt-super-seguro'` (predecible)
**Severidad:** CRÍTICA
**Fix:** Validar que JWT_SECRET siempre esté definido en .env

### 2. Función `generarToken` no definida
**Archivo:** `backend/routes/auth.js:7`
**Problema:** Se importa `generarToken` pero no existe en `auth.js`
**Severidad:** CRÍTICA (bloquea login)
**Fix:** Crear función o importar correctamente

### 3. GET /api/alertas SIN autenticación
**Archivo:** `backend/routes/alertas.js:33`
**Problema:** Cualquiera puede ver todas las alertas/estadísticas sin token
**Severidad:** CRÍTICA
**Fix:** Agregar middleware `authenticateToken` a GET /api/alertas y /stats

### 4. Exposición de errores técnicos
**Archivo:** Múltiples endpoints - `detalle: error.message`
**Problema:** Errores de BD/sistema se devuelven al cliente
**Severidad:** ALTA
**Fix:** En producción, no exponer detalles técnicos

### 5. DELETE /api/alertas falta
**Problema:** No hay forma de eliminar alertas (ni GET sin auth tampoco existe DELETE)
**Severidad:** MEDIA
**Fix:** Implementar DELETE con autenticación (opcional pero buena práctica)

---

## 🟡 VULNERABILIDADES MEDIAS

### 6. Validación incompleta de query parameters
**Archivo:** `backend/routes/alertas.js:38`
**Problema:** Filtros no validan exhaustivamente tipos antes de usar en query
**Fix:** Validar tipos en query parameters

### 7. Falta de throttling en GET
**Problema:** No hay rate limit específico para GET (solo general)
**Fix:** Agregar rate limit específico para GET /api/alertas

### 8. Token sin expiración controlada en set
**Archivo:** `backend/routes/auth.js:44-47`
**Problema:** `JWT_EXPIRES_IN` se devuelve en respuesta pero no se usa en firma
**Fix:** Pasar `expiresIn` a jwt.sign()

### 9. No hay HTTPS enforcement
**Archivo:** `backend/server.js`
**Problema:** No redirige HTTP a HTTPS en producción
**Fix:** Agregar middleware de redirección HTTP->HTTPS

### 10. Logs de error sin redacción de datos sensibles
**Archivo:** `backend/server.js:59`
**Problema:** Error logs pueden contener información sensible
**Fix:** Redactar logs en producción

---

## 🔵 RECOMENDACIONES ADICIONALES

- Agregar endpoint para cambiar contraseña
- Implementar auditoría de accesos (quién cambió qué y cuándo)
- Agregar cookie-based CSRF tokens
- Usar HTTPS en producción
- Encripción de datos sensibles en BD
- Validar X-Forwarded-For para IP real (si está detrás de proxy)
- Headers de seguridad adicionales (X-Content-Type-Options, X-Frame-Options)

---

## PLAN DE FIXES — ✅ COMPLETADO

1. ✅ Crear `.env.example` con todas las variables requeridas
2. ✅ Fijar JWT_SECRET y generarToken - Backend/middleware/auth.js
3. ✅ Proteger GET endpoints con autenticación - Backend/routes/alertas.js
4. ✅ Validar query parameters correctamente - query() validator en GET /alertas
5. ✅ Remover detalles de error en producción - NODE_ENV check en todos los endpoints
6. ✅ Agregar rate limit a GETs - Rate limit general ya existía, reforzado
7. ✅ Implementar DELETE endpoint - DELETE /api/alertas/:id con auth
8. ✅ Agregar middleware HTTPS enforcement - Backend/server.js
9. ✅ Mejorar logging seguro - [AUTH_FAIL], [FORBIDDEN], [ATTACK] en server.js

---

## ARCHIVOS MODIFICADOS

✅ `backend/middleware/auth.js` - JWT_SECRET obligatorio, generarToken() function
✅ `backend/routes/auth.js` - ADMIN_USER y ADMIN_HASH obligatorios
✅ `backend/routes/alertas.js` - Autenticación en todos los GETs, validación mejorada
✅ `backend/server.js` - HTTPS enforcement, headers de seguridad, logging, graceful shutdown
✅ `.env.example` - Instrucciones de seguridad detalladas
✅ `SECURITY_GUIDE.md` - Guía completa de seguridad (NUEVO)

