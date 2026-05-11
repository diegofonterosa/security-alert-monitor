// server.js — Mini-SIEM Personal
// Fase 1: servidor base + conexión MongoDB

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('node:path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';

// ── Middleware ────────────────────────────────────────────────────────────────
// Helmet con CSP mejorado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS restrictivo
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
  maxAge: 600,
}));

// Logging personalizado con eventos de seguridad
const securityLog = (req, res, next) => {
  const origSend = res.send;
  res.send = function(data) {
    // Registrar respuestas con status >= 400 (errores)
    if (res.statusCode >= 400) {
      console.warn(`[SECURITY] ${req.method} ${req.path} - Status: ${res.statusCode} - IP: ${req.ip}`);
    }
    // Registrar intentos de rate limiting
    if (res.statusCode === 429) {
      console.error(`[ATTACK] Rate limit excedido - IP: ${req.ip}`);
    }
    res.send = origSend;
    return res.send(data);
  };
  next();
};

app.use(securityLog);
app.use(morgan('combined')); // Logging de solicitudes HTTP

// Body parser con límite
app.use(express.json({ limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No aplicar rate limit a solicitudes de health check
    return req.path === '/api/health';
  },
});
app.use('/api/', limiter);

// ── Conexión MongoDB ──────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`MongoDB conectado: ${MONGO_URI}`))
  .catch(err => {
    console.error('Error de conexión MongoDB:', err.message);
    process.exit(1);
  });

// ── Rutas (se ampliarán en Fase 2) ───────────────────────────────────────────
app.use('/api/alertas', require('./routes/alertas'));

// ── Ruta de salud ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  // No exponer detalles de la DB para evitar fingerprinting
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// ── Fallback — servir index.html para rutas no API ────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor Mini-SIEM corriendo en http://localhost:${PORT}`);
});
