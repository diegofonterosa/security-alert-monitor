// server.js — Mini-SIEM Personal
// Fase 1: servidor base + conexión MongoDB

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-siem';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

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
  res.json({
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString(),
  });
});

// ── Fallback — servir index.html para rutas no API ────────────────────────────
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor Mini-SIEM corriendo en http://localhost:${PORT}`);
});
