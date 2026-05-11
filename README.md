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

## 🚀 Endpoints API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado de salud del servicio |
| `GET` | `/api/alertas` | Listar todas las alertas (con filtros y paginación) |
| `GET` | `/api/alertas/stats` | Estadísticas agregadas por severidad y estado |
| `GET` | `/api/alertas/:id` | Obtener alerta por ID |
| `POST` | `/api/alertas` | Crear nueva alerta |
| `PATCH` | `/api/alertas/:id/estado` | Actualizar estado de alerta |
| `PATCH` | `/api/alertas/:id/operador` | Asignar operador a alerta |
| `DELETE` | `/api/alertas/:id` | Eliminar alerta |

---

## � Características de Seguridad

- **Rate Limiting**: Límite de 100 solicitudes por IP cada 15 minutos
- **Validación de Entrada**: Sanitización y validación con express-validator
- **Prevención XSS**: Escape de HTML en contenido dinámico
- **Headers de Seguridad**: Configurados con Helmet (HSTS, CSP, etc.)
- **Control CORS**: Solo permite orígenes locales
- **Logging**: Registro de solicitudes HTTP con Morgan
- **Límite de Tamaño**: Body limitado a 10MB para prevenir DoS

---

- [x] Definición del proyecto y stack
- [x] **Fase 1** — Modelo Mongoose + seed (20 alertas)
- [x] **Fase 2** — API REST: CRUD completo
- [x] **Fase 3** — Dashboard HTML con tabla en vivo
- [x] **Fase 4** — Filtros por severidad, estado y búsqueda
- [ ] **Fase 5** — Gráficas con Chart.js + aggregation pipeline
- [ ] **Fase 6** — Autenticación JWT + roles
- [ ] **Fase 7** — Deploy en Atlas + Render
- [x] **Fase 8** — Mejoras de seguridad (rate limiting, validación, sanitización)

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

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz basándote en `.env.example`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/mini-siem
```

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
