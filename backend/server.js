// server.js — Mini-SIEM Personal
// Fase 1: servidor base + conexión MongoDB

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet()); // Headers de seguridad
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Permitir solo localhost
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(morgan('combined')); // Logging de solicitudes
app.use(express.json({ limit: '10mb' })); // Limitar tamaño del body
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

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
