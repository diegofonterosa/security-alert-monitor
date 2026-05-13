# 🛡️ Security Alert Monitor

> Panel de monitorización de alertas de seguridad inspirado en entornos CRA reales.  
> Stack: Node.js · Express · MongoDB · HTML/CSS/JS Vanilla

![Status](https://img.shields.io/badge/status-funcional-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Descripción

**Security Alert Monitor** es un mini-SIEM (Security Information and Event Management) personal que permite recibir, almacenar, filtrar y visualizar eventos de seguridad en tiempo real a través de una API REST y un dashboard web.

Desarrollado como proyecto de portfolio integrando bases de datos NoSQL (MongoDB) con un backend Express y un frontend estático — sin frameworks, HTML/CSS/JS puro. Incluye medidas de seguridad avanzadas como rate limiting, validación de entrada y prevención de XSS.

---

## 🎯 Objetivos del Proyecto

- Aplicar bases de datos **NoSQL (MongoDB)** en un caso de uso real
- Construir una **API REST completa** con Node.js y Express
- Diseñar un **dashboard de seguridad** funcional con HTML/CSS/JS
- Practicar conceptos de **ASIR** y **Máster en Ciberseguridad**
- Desplegar en cloud con **MongoDB Atlas + Render**

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express |
| Base de datos | MongoDB + Mongoose |
| Frontend | HTML5 + CSS3 + JavaScript (ES6+) |
| Seguridad | Helmet, CORS, Rate Limiting, Express Validator |
| Logging | Morgan |
| Config | dotenv |
| Dev | nodemon |
| Deploy | MongoDB Atlas + Render |

---

## 📁 Estructura del Proyecto

```
security-alert-monitor/
├── backend/
│   ├── models/
│   │   └── Alerta.js          # Esquema Mongoose
│   ├── routes/
│   │   └── alertas.js         # Endpoints API REST
│   ├── middleware/
│   │   └── auth.js            # Autenticación JWT
│   ├── seed.js                # Datos de ejemplo (20 alertas)
│   └── server.js              # Punto de entrada
├── frontend/
│   ├── index.html             # Dashboard principal
│   ├── css/
│   │   └── style.css          # Estilos
│   └── js/
│       └── app.js             # Lógica cliente (Fetch API)
├── .env.example               # Variables de entorno (plantilla)
├── .gitignore
├── package.json
└── README.md
```

---

## 🗃️ Modelo de Datos — Colección `alertas`

```json
{
  "_id": "ObjectId",
  "timestamp": "2026-03-11T14:32:00Z",
  "tipo": "Acceso no autorizado | Fuerza bruta | Malware detectado | Exfiltración de datos | Escaneo de puertos | Escalada de privilegios | DoS/DDoS | Phishing | Movimiento lateral | Anomalía de red",
  "severidad": "Baja | Media | Alta | Crítica",
  "origen_ip": "192.168.1.45",
  "dispositivo": "workstation-contabilidad",
  "descripcion": "Descripción detallada de la alerta",
  "estado": "Nueva | En revisión | Resuelta | Falso positivo",
  "operador": "Diego"
}
```

---

## 👤 Autenticación

El proyecto utiliza credenciales de administrador configuradas en variables de entorno (`ADMIN_USER` y `ADMIN_HASH`) y no mantiene una colección de usuarios en la base de datos.

---

## 🚀 Endpoints API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado de salud del servicio |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token JWT |
| `POST` | `/api/auth/logout` | Cerrar sesión (el cliente elimina el token) |
| `GET` | `/api/alertas` | Listar todas las alertas (con filtros y paginación) |
| `GET` | `/api/alertas/stats` | Estadísticas agregadas por severidad y estado |
| `GET` | `/api/alertas/charts/timeline` | Evolución temporal (últimos 7 días) |
| `GET` | `/api/alertas/charts/severity` | Distribución por severidad |
| `GET` | `/api/alertas/charts/types` | Top 10 tipos de alerta |
| `GET` | `/api/alertas/:id` | Obtener alerta por ID |
| `POST` | `/api/alertas` | Crear nueva alerta |
| `PATCH` | `/api/alertas/:id/estado` | Actualizar estado de alerta |
| `PATCH` | `/api/alertas/:id/operador` | Asignar operador a alerta |
| `DELETE` | `/api/alertas/:id` | Eliminar alerta |

## 🔐 Características de Seguridad

- **Autenticación JWT**: Tokens JWT con expiración de 24 horas y roles (user/admin)
- **Rate Limiting**: Límite de 100 solicitudes por IP cada 15 minutos
- **Validación de Entrada**: Sanitización y validación con express-validator
- **Prevención XSS**: Escape de HTML en contenido dinámico (backend + frontend)
- **Prevención de Mass Assignment**: Whitelist explícita de campos permitidos en POST
- **Headers de Seguridad**: Configurados con Helmet (HSTS, CSP, etc.)
- **Subresource Integrity**: SRI en recursos externos (Google Fonts)
- **Control CORS**: Solo permite el origen autorizado en producción y localhost en desarrollo
- **Logging**: Registro de solicitudes HTTP con Morgan
- **Límite de Tamaño**: Body limitado a 10MB para prevenir DoS
- **Accesibilidad**: Labels y elementos form correctamente asociados

---

- [x] Definición del proyecto y stack
- [x] **Fase 1** — Modelo Mongoose + seed (20 alertas)
- [x] **Fase 2** — API REST: CRUD completo
- [x] **Fase 3** — Dashboard HTML con tabla en vivo
- [x] **Fase 4** — Filtros por severidad, estado y búsqueda
- [x] **Fase 5** — Gráficas con Chart.js + aggregation pipeline
- [x] **Fase 6** — Autenticación JWT + roles
- [x] **Fase 7** — Deploy en Atlas + Render
- [x] **Fase 8** — Mejoras de seguridad (rate limiting, validación, sanitización)
- [x] **Fase 9** — SonarQube fixes (NoSQL injection, XSS, contrast, code smells)

---

## 🔍 Auditoría de Seguridad (SonarQube)

Se han identificado y corregido los siguientes issues de SonarQube:

### ✅ Vulnerabilidades Corregidas

| Issue | Severidad | Descripción | Fix |
|-------|-----------|-------------|-----|
| Backend: NoSQL Injection Risk | 🔴 Blocker | Construcción dinámica de queries | Mapeo explícito de valores permitidos con whitelist |
| Frontend: XSS Risk (badgeSeveridad) | 🔴 Blocker | HTML sin escapar de valores de usuario | Uso de `escaparHTML()` en valores antes de renderizar |
| Frontend: XSS Risk (badgeEstado) | 🔴 Blocker | HTML sin escapar de valores de usuario | Uso de `escaparHTML()` en valores antes de renderizar |
| Frontend: Unexpected Negated Condition | 🟡 Minor | Lógica invertida en validación | Refactorización a bloque explícito `if`/`throw` |
| Frontend: Contrast Ratio (#ff4444) | 🟡 Major | Texto rojo no cumple WCAG AA | Cambio a `#cc0000` (ratio 4.5:1) |
| Frontend: Prefer globalThis | 🟡 Minor | Uso de `window` en lugar de `globalThis` | Cambio a `globalThis.fetchAuth` |

### 📋 Detalles de Correcciones

#### 1. NoSQL Injection Prevention (backend/routes/alertas.js)
```javascript
// ❌ ANTES: Construcción dinámica del filtro
const filtro = {};
if (severidad) filtro.severidad = severidad;  // Vulnerable

// ✅ DESPUÉS: Whitelist explícito de valores
const severidadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
if (severidad && severidadesValidas.includes(severidad)) {
  filtro.severidad = severidad;  // Seguro
}
```

#### 2. XSS Prevention (frontend/js/app.js)
```javascript
// ❌ ANTES: Valores sin escapar
return `<span class="badge">${sev.toUpperCase()}</span>`;

// ✅ DESPUÉS: Valores escapados
const displayText = escaparHTML(String(sev || '').toUpperCase());
return `<span class="badge">${displayText}</span>`;
```

#### 3. Accessibility - Contrast Ratio (frontend/css/style.css)
```css
/* ❌ ANTES: #ff4444 (ratio 2.8:1) - No cumple WCAG AA */
.login-error { color: #ff4444; }

/* ✅ DESPUÉS: #cc0000 (ratio 4.5:1) - Cumple WCAG AAA */
.login-error { color: #cc0000; }
```

#### 4. Use globalThis (frontend/js/auth.js)
```javascript
// ❌ ANTES
window.fetchAuth = function(url, options = {}) { ... }

// ✅ DESPUÉS
globalThis.fetchAuth = function(url, options = {}) { ... }
```

### 📚 Referencias de Seguridad

- [OWASP NoSQL Injection](https://owasp.org/www-community/attacks/NoSQL_Injection)
- [OWASP XSS Prevention](https://owasp.org/www-community/attacks/xss/)
- [WCAG 2.1 Contrast (Minimum)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [MDN: globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
- [SonarQube Rules](https://rules.sonarsource.com/javascript)

---

## ⚙️ Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/diegofonterosa/security-alert-monitor.git
cd security-alert-monitor

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu URI de MongoDB

# 4. Cargar datos de ejemplo
node backend/seed.js

# 5. Arrancar el servidor
npm run dev
```

---

## � Despliegue en Producción

### MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un nuevo cluster gratuito
3. Configura un usuario de base de datos y whitelist de IPs (o 0.0.0.0/0 para desarrollo)
4. Obtén la connection string y actualiza `MONGO_URI` en `.env`

### Render

1. Crea una cuenta en [Render](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo **Web Service** con las siguientes configuraciones:
   - **Runtime**: Node
   - **Build Command**: (vacío)
   - **Start Command**: `npm start`
   - **Environment Variables**: Copia las de tu `.env` (PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL)
4. Despliega y obtén la URL de tu app

### Configuración Post-Despliegue

1. Actualiza `FRONTEND_URL` en las variables de entorno de Render con la URL HTTPS de tu app (por ejemplo, `https://mi-app.onrender.com`).
2. `FRONTEND_URL` debe ser una URL HTTPS válida en producción para que CORS y la redirección funcionen correctamente.
3. Ejecuta el seed en producción si es necesario (conecta a Atlas localmente o via SSH).
4. Configura `ADMIN_USER` y `ADMIN_HASH` en tus variables de entorno; no hay credenciales codificadas en el código.

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz basándote en `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/mini-siem
JWT_SECRET=una_clave_segura
ADMIN_USER=admin
ADMIN_HASH=<hash_bcrypt>
FRONTEND_URL=https://mi-app.onrender.com
```

> En producción, `FRONTEND_URL` debe ser una URL HTTPS válida. En desarrollo se usa `http://localhost:3000` por defecto si no se define.

---

## 👤 Autor

**Diego Pérez Fonterosa**  
IT Support Technician · CRA Technical Support Operator  
ASIR · Máster en Ciberseguridad

[![GitHub](https://img.shields.io/badge/GitHub-diegofonterosa-black?logo=github)](https://github.com/diegofonterosa)
[![Portfolio](https://img.shields.io/badge/Portfolio-online-blue)](https://portfoliodiegofonterosa.netlify.app)

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).
