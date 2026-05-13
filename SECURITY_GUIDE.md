# 🔐 Guía de Seguridad - Mini-SIEM Personal

## Cambios de Seguridad Implementados

### ✅ Vulnerabilidades Críticas Corregidas

#### 1. **JWT_SECRET forzado en .env**
- ❌ Antes: Valor por defecto predecible si faltaba en .env
- ✅ Ahora: El servidor falla con error si JWT_SECRET no está definido
- **Acción requerida**: Generar un JWT_SECRET seguro antes de ejecutar

#### 2. **ADMIN_USER y ADMIN_HASH validados**
- ❌ Antes: Valores por defecto permitían acceso con credenciales débiles
- ✅ Ahora: El servidor falla si faltan estas variables críticas en .env
- **Acción requerida**: Generar ADMIN_HASH seguro con bcrypt

#### 3. **GET endpoints ahora requieren autenticación JWT**
- ❌ Antes: Cualquiera podía ver todas las alertas sin token
- ✅ Ahora: Todos los GET requieren `Authorization: Bearer <token>`
- Afectados: `/api/alertas`, `/api/alertas/:id`, `/api/alertas/stats`, `/api/alertas/charts/*`

#### 4. **Validación exhaustiva de query parameters**
- ❌ Antes: Filtros no validaban tipos
- ✅ Ahora: `query()` valida severidad, estado, tipo, IP, rango

#### 5. **Errores no exponen detalles técnicos en producción**
- ❌ Antes: `detalle: error.message` revelaba info de BD
- ✅ Ahora: En producción, solo se devuelve mensaje genérico
- El detalle técnico solo se muestra en desarrollo

#### 6. **Nuevo endpoint DELETE**
- ✅ Implementado: `DELETE /api/alertas/:id` (requiere autenticación)
- Permite auditoría y borrado controlado de alertas

---

## 🚀 Setup Seguro

### 1. Generar JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copia el resultado y ponlo en `.env`:
```
JWT_SECRET=tu_jwt_secret_aleatorio_32_caracteres_minimo
```

### 2. Generar ADMIN_HASH
```bash
node -e "require('bcryptjs').hash('TU_PASSWORD_FUERTE_AQUI', 10).then(console.log)"
```
Requisitos de contraseña:
- Mínimo 12 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 símbolo especial

Copia el hash (`$2a$...`) en `.env`:
```
ADMIN_HASH=$2a$10$tu_hash_aqui
```

### 3. Crear archivo `.env` desde plantilla
```bash
cp .env.example .env
# Editar .env y completar valores
```

### 4. Proteger el archivo .env
```bash
chmod 600 .env
```

---

## 🔒 Configuración en Producción

### Variables de entorno críticas:
```env
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/mini-siem
FRONTEND_URL=https://tu-dominio.com
JWT_SECRET=<generar_con_crypto>
JWT_EXPIRES_IN=1h
ADMIN_USER=tu_usuario_seguro
ADMIN_HASH=<generar_con_bcrypt>
```

### HTTPS Obligatorio
- En producción: El servidor redirige HTTP → HTTPS automáticamente
- Usar certificados SSL válidos (Let's Encrypt recomendado)
- HSTS headers activados (fuerza HTTPS por 1 año)

### Rate Limiting
- General: 100 req/15 min por IP
- Login: 10 intentos/15 min (brute force protection)
- `/api/health` excluido del rate limit

### Headers de Seguridad
- `Content-Security-Policy` (CSP) - Previene XSS
- `X-Frame-Options: DENY` - Previene clickjacking
- `X-Content-Type-Options: nosniff` - Previene MIME sniffing
- `X-XSS-Protection` - Protección XSS legacy
- `Strict-Transport-Security (HSTS)` - Fuerza HTTPS

### CORS en Producción
- Solo acepta requests de `FRONTEND_URL`
- Métodos permitidos: GET, POST, PATCH, DELETE
- No permite credenciales (cookies) por defecto

---

## 🛡️ Buenas Prácticas

### 1. Rotation de Credenciales
```bash
# Si JWT_SECRET se comprome:
1. Generar nuevo JWT_SECRET
2. Actualizar en .env
3. Reiniciar servidor (todos los tokens anteriores expiran)

# Si ADMIN_HASH se comprome:
1. Generar nueva contraseña fuerte
2. Generar nuevo hash bcrypt
3. Actualizar ADMIN_HASH en .env
4. Reiniciar servidor
```

### 2. Monitoreo de Seguridad
El servidor registra:
- `[AUTH_FAIL]` - Intentos fallidos de autenticación
- `[FORBIDDEN]` - Acceso permitido (403)
- `[ATTACK]` - Rate limit excedido
- `[ERROR]` - Errores del servidor (5xx)

Revisar logs regularmente:
```bash
journalctl -u mini-siem -f  # si usas systemd
# o
cat /var/log/mini-siem.log
```

### 3. Backup de Base de Datos
```bash
# Backup MongoDB
mongodump --uri="$MONGO_URI" --out=./backups/

# Restore MongoDB
mongorestore --uri="$MONGO_URI" ./backups/
```

### 4. Auditoría de Cambios
- Cada alerta tiene `timestamp` inmutable
- Los cambios de estado/operador actualizan `updatedAt`
- Logs de seguridad en consola

### 5. Dependencias Seguras
Realizar auditoría regular:
```bash
npm audit
npm audit fix
npm outdated
```

---

## ⚠️ Vulnerabilidades Conocidas / Limitaciones

### 1. Autenticación Simple (sin OAuth/SAML)
- **Mitigación**: Usar contraseña fuerte, HTTPS, rate limiting

### 2. No hay 2FA/MFA
- **Recomendación futura**: Integrar Google Authenticator o TOTP

### 3. Auditoría limitada
- **Mejora futura**: Agregar tabla de auditoría con quién hizo qué y cuándo

### 4. Sin encriptación de datos en reposo
- **Mejora futura**: Encriptar campos sensibles antes de guardar en MongoDB

### 5. CORS tokens en sessionStorage
- **Mitigación**: sessionStorage borra al cerrar navegador (mejor que localStorage)
- **Riesgo residual**: XSS podría robar token de sessionStorage

---

## 🐛 Reporting de Vulnerabilidades

Si encuentras un problema de seguridad:
1. ❌ NO publiques en Issues públicas
2. 📧 Email a: security@minisiem.local (o mantenedor privado)
3. 📝 Describe el problema con detalles de reproducción

---

## 📚 Referencias de Seguridad

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
