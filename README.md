# 🛡️ Security Alert Monitor

> Panel de monitorización de alertas de seguridad inspirado en entornos CRA reales.  
> Stack: Node.js · Express · MongoDB · HTML/CSS/JS Vanilla

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Descripción

**Security Alert Monitor** es un mini-SIEM (Security Information and Event Management) personal que permite recibir, almacenar, filtrar y visualizar eventos de seguridad en tiempo real a través de una API REST y un dashboard web.

Desarrollado como proyecto de portfolio integrando bases de datos NoSQL (MongoDB) con un backend Express y un frontend estático — sin frameworks, HTML/CSS/JS puro.

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
| Gráficas | Chart.js |
| Autenticación | JWT |
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
  "tipo": "intrusión | acceso | fallo_red | alarma_fisica",
  "severidad": "baja | media | alta | crítica",
  "origen_ip": "192.168.1.45",
  "dispositivo": "Cámara-Sector-A",
  "descripcion": "Movimiento detectado fuera de horario",
  "estado": "pendiente | revisada | resuelta",
  "operador": "Diego"
}
```

---

## 🚀 Endpoints API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/alertas` | Listar todas las alertas |
| `GET` | `/api/alertas/:id` | Obtener alerta por ID |
| `GET` | `/api/alertas?severidad=alta` | Filtrar por severidad/estado |
| `POST` | `/api/alertas` | Crear nueva alerta |
| `PATCH` | `/api/alertas/:id/estado` | Actualizar estado |
| `DELETE` | `/api/alertas/:id` | Eliminar alerta |

---

## 🗺️ Roadmap

- [x] Definición del proyecto y stack
- [ ] **Fase 1** — Modelo Mongoose + seed (20 alertas)
- [ ] **Fase 2** — API REST: CRUD completo
- [ ] **Fase 3** — Dashboard HTML con tabla en vivo
- [ ] **Fase 4** — Filtros por severidad, estado y búsqueda
- [ ] **Fase 5** — Gráficas con Chart.js + aggregation pipeline
- [ ] **Fase 6** — Autenticación JWT + roles
- [ ] **Fase 7** — Deploy en Atlas + Render

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
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/siem
JWT_SECRET=tu_clave_secreta
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
