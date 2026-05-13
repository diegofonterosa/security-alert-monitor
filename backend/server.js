// server.js — Mini-SIEM Personal
// Seguridad mejorada: validación de env, CORS, Rate Limiting, Helmet, Logging

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const path       = require('node:path');
const rateLimit  = require('express-rate-limit');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');

// ── Validación de variables de entorno críticas ────────────────────────────────
const requiredEnvVars = ['JWT_SECRET', 'ADMIN_USER', 'ADMIN_HASH'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error(`❌ ERROR CRÍTICO: Variables de entorno faltantes: ${missingVars.join(', ')}`);
    console.error('  Copia .env.example a .env y rellena los valores.');
    process.exit(1);
}

const app       = express();
const PORT      = process.env.PORT      || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';
const NODE_ENV  = process.env.NODE_ENV  || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('❌ ERROR CRÍTICO: FRONTEND_URL es obligatorio en producción.');
  process.exit(1);
}

const frontendOrigin = (() => {
  try {
    return new URL(FRONTEND_URL).origin;
  } catch {
    return FRONTEND_URL;
  }
})();

console.log(`🚀 Mini-SIEM iniciando en modo: ${NODE_ENV}`);

// ── Middleware: Forzar HTTPS en producción ─────────────────────────────────────
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(307, `${frontendOrigin}${req.originalUrl}`);
    } else {
      next();
    }
  });
}

// ── Middleware: Seguridad HTTP Headers ─────────────────────────────────────────
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
          maxAge: 31536000, // 1 año
          includeSubDomains: true,
          preload: true,
    },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    xssFilter: true,                // X-XSS-Protection
    noSniff: true,                  // X-Content-Type-Options: nosniff
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ── Middleware: CORS ───────────────────────────────────────────────────────────
// En producción: solo acepta FRONTEND_URL
// En desarrollo: localhost
app.use(cors({
    origin: NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 600,
}));

// ── Middleware: Security Event Logging ─────────────────────────────────────────
const securityLog = (req, res, next) => {
    const origSend = res.send;
    res.send = function(data) {
          const statusCode = res.statusCode;

          // Log errores de autenticación (401, 403)
          if (statusCode === 401) {
                  console.warn(`[AUTH_FAIL] ${req.method} ${req.path} - IP: ${req.ip}`);
          }
          if (statusCode === 403) {
                  console.warn(`[FORBIDDEN] ${req.method} ${req.path} - IP: ${req.ip}`);
          }

          // Log errores generales (5xx)
          if (statusCode >= 500) {
                  console.error(`[ERROR] ${req.method} ${req.path} - Status: ${statusCode} - IP: ${req.ip}`);
          }

          // Log intentos de rate limit
          if (statusCode === 429) {
                  console.error(`[ATTACK] Rate limit excedido - IP: ${req.ip} - Path: ${req.path}`);
          }

          res.send = origSend;
          return res.send(data);
    };
    next();
};

app.use(securityLog);
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
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
app.use('/api/auth', require('./routes/auth')); // Fase 6: autenticacion JWT

// ── Ruta de salud ─────────────────────────────────────────────────────────────
// FIX Fase 5: ahora devuelve db: 'conectado' para que el indicador del dashboard funcione
app.get('/api/health', (req, res) => {
    const estadoDB = mongoose.connection.readyState === 1
      ? 'conectado'
          : 'desconectado';

    res.json({
          status: 'OK',
          db: estadoDB,
          timestamp: new Date().toISOString(),
    });
});

// ── Fallback — servir index.html para rutas no API ────────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Middleware: Error Handler Global ───────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`, err.stack);

    // No exponer detalles técnicos en producción
    const message = NODE_ENV === 'production'
      ? 'Error interno del servidor'
          : err.message;

    res.status(err.status || 500).json({
          error: message,
          ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`✅ Servidor Mini-SIEM corriendo en http://localhost:${PORT}`);
    console.log(`   Modo: ${NODE_ENV}`);
    console.log(`   MongoDB: ${MONGO_URI.replace(/:[^:]*@/, ':****@')}`);
});

// ── Graceful Shutdown ────────────────────────────────────────────────────────────
process.on('SIGINT', () => {
    console.log('\n🛑 Señal SIGINT recibida. Cerrando servidor...');
    server.close(() => {
          console.log('✅ Servidor cerrado.');
          mongoose.connection.close(() => {
                  console.log('✅ Conexión MongoDB cerrada.');
                  process.exit(0);
          });
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Señal SIGTERM recibida. Cerrando servidor...');
    server.close(() => {
          mongoose.connection.close();
          process.exit(0);
    });
});
app.use('/api/', limiter);
