// server.js — Mini-SIEM Personal
// Fases 1-8 completas

require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const path      = require('node:path');
const rateLimit = require('express-rate-limit');
const cors      = require('cors');
const morgan    = require('morgan');
const helmet    = require('helmet');

const app       = express();
const PORT      = process.env.PORT      || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {
          directives: {
                  defaultSrc: ["'self'"],
                  styleSrc:   ["'self'", 'https://fonts.googleapis.com'],
                  scriptSrc:  ["'self'", 'https://cdn.jsdelivr.net'],
                  fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
                  imgSrc:     ["'self'", 'data:'],
                  connectSrc: ["'self'"],
          },
    },
    hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
    },
}));

// CORS — en produccion solo acepta FRONTEND_URL, en dev acepta localhost
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 600,
}));

// Logging de eventos de seguridad
const securityLog = (req, res, next) => {
    const origSend = res.send;
    res.send = function(data) {
          if (res.statusCode >= 400) {
                  console.warn(`[SECURITY] ${req.method} ${req.path} - Status: ${res.statusCode} - IP: ${req.ip}`);
          }
          if (res.statusCode === 429) {
                  console.error(`[ATTACK] Rate limit excedido - IP: ${req.ip}`);
          }
          res.send = origSend;
          return res.send(data);
    };
    next();
};

app.use(securityLog);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting general: 100 req / 15 min por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas solicitudes desde esta IP, intenta mas tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health',
});
app.use('/api/', limiter);

// Rate limiting estricto para login: 10 intentos / 15 min (anti fuerza bruta)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Demasiados intentos de login. Espera 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// ── Conexion MongoDB ──────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(`MongoDB conectado: ${MONGO_URI}`))
  .catch(err => {
        console.error('Error de conexion MongoDB:', err.message);
        process.exit(1);
  });

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/auth',    require('./routes/auth'));      // Fase 6: autenticacion JWT

// ── Ruta de salud ─────────────────────────────────────────────────────────────
// FIX Fase 5: ahora devuelve db: 'conectado' para que el indicador del dashboard funcione
app.get('/api/health', (req, res) => {
    const estadoDB = mongoose.connection.readyState === 1
      ? 'conectado'
          : 'desconectado';

          res.json({
                status:    'OK',
                db:        estadoDB,
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
