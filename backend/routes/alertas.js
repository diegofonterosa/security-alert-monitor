// backend/routes/alertas.js — API REST completa
// Mini-SIEM Personal — Fase 2: CRUD de alertas
 
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Alerta = require('../models/Alerta');
 
// ── Helper: validar ObjectId ──────────────────────────────────────────────────
function esIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}
 
// ── GET /api/alertas ──────────────────────────────────────────────────────────
// Devuelve todas las alertas. Admite filtros por query string:
//   ?severidad=Alta
//   ?estado=Nueva
//   ?tipo=Phishing
//   ?origen_ip=192.168.1.55
//   ?limite=10          (por defecto 50)
//   ?pagina=2           (paginación)
// Ejemplo: GET /api/alertas?severidad=Crítica&estado=Nueva&limite=5
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { severidad, estado, tipo, origen_ip, limite = 50, pagina = 1 } = req.query;
 
    // Construir filtro dinámicamente solo con los campos que lleguen
    const filtro = {};
    if (severidad) filtro.severidad = severidad;
    if (estado)    filtro.estado    = estado;
    if (tipo)      filtro.tipo      = tipo;
    if (origen_ip) filtro.origen_ip = origen_ip;
 
    const limitNum = Math.min(Number.parseInt(limite), 100); // máximo 100 por página
    const skip     = (Number.parseInt(pagina) - 1) * limitNum;
 
    // Ejecutar consulta y contar total en paralelo
    const [alertas, total] = await Promise.all([
      Alerta.find(filtro)
        .sort({ timestamp: -1 })   // más recientes primero
        .skip(skip)
        .limit(limitNum),
      Alerta.countDocuments(filtro),
    ]);
 
    res.json({
      total,
      pagina: Number.parseInt(pagina),
      limite: limitNum,
      paginas: Math.ceil(total / limitNum),
      datos: alertas,
    });
 
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas', detalle: error.message });
  }
});
 
// ── GET /api/alertas/stats ────────────────────────────────────────────────────
// Resumen estadístico: totales por severidad y por estado
// Útil para el dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [porSeveridad, porEstado, porTipo] = await Promise.all([
      Alerta.aggregate([
        { $group: { _id: '$severidad', total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Alerta.aggregate([
        { $group: { _id: '$estado', total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Alerta.aggregate([
        { $group: { _id: '$tipo', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 }, // top 5 tipos de alerta
      ]),
    ]);
 
    res.json({
      por_severidad: porSeveridad,
      por_estado: porEstado,
      top_tipos: porTipo,
      total: await Alerta.countDocuments(),
    });
 
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas', detalle: error.message });
  }
});
 
// ── GET /api/alertas/:id ──────────────────────────────────────────────────────
// Devuelve una alerta por su ID de MongoDB
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }
 
  try {
    const alerta = await Alerta.findById(req.params.id);
 
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
 
    res.json(alerta);
 
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la alerta', detalle: error.message });
  }
});
 
// ── POST /api/alertas ─────────────────────────────────────────────────────────
// Crea una nueva alerta
// Body JSON con los campos del esquema (timestamp es opcional, default = ahora)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', [
  body('tipo').isIn([
    'Acceso no autorizado',
    'Fuerza bruta',
    'Malware detectado',
    'Exfiltración de datos',
    'Escaneo de puertos',
    'Escalada de privilegios',
    'DoS/DDoS',
    'Phishing',
    'Movimiento lateral',
    'Anomalía de red',
  ]).withMessage('Tipo de alerta no válido'),
  body('severidad').isIn(['Baja', 'Media', 'Alta', 'Crítica']).withMessage('Severidad no válida'),
  body('origen_ip').isIP().withMessage('IP de origen no válida'),
  body('dispositivo').isLength({ min: 1, max: 100 }).trim().escape().withMessage('Dispositivo requerido y debe ser menor a 100 caracteres'),
  body('descripcion').isLength({ min: 1, max: 500 }).trim().escape().withMessage('Descripción requerida y debe ser menor a 500 caracteres'),
  body('estado').optional().isIn(['Nueva', 'En revisión', 'Resuelta', 'Falso positivo']).withMessage('Estado no válido'),
  body('operador').optional().isLength({ max: 50 }).trim().escape().withMessage('Operador debe ser menor a 50 caracteres'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos no válidos', detalle: errors.array() });
  }

  try {
    // Whitelist de campos permitidos para evitar mass assignment
    const campos = {
      tipo: req.body.tipo,
      severidad: req.body.severidad,
      origen_ip: req.body.origen_ip,
      dispositivo: req.body.dispositivo,
      descripcion: req.body.descripcion,
      estado: req.body.estado || 'Nueva',
      operador: req.body.operador || null,
    };

    const nuevaAlerta = new Alerta(campos);
    const guardada = await nuevaAlerta.save();

    res.status(201).json(guardada);

  } catch (error) {
    // Error de validación de Mongoose (campos requeridos, enums, regex IP...)
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: 'Datos no válidos', detalle: errores });
    }
    res.status(500).json({ error: 'Error al crear la alerta', detalle: error.message });
  }
});
 
// ── PATCH /api/alertas/:id/estado ────────────────────────────────────────────
// Actualiza solo el estado de una alerta
// Body: { "estado": "Resuelta" }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/estado', [
  body('estado').isIn(['Nueva', 'En revisión', 'Resuelta', 'Falso positivo']).withMessage('Estado no válido'),
], async (req, res) => {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos no válidos', detalle: errors.array() });
  }

  const { estado } = req.body;

  try {
    const actualizada = await Alerta.findByIdAndUpdate(
      req.params.id,
      { estado },
      {
        new: true,          // devuelve el documento ya actualizado
        runValidators: true, // ejecuta las validaciones del schema (enum)
      }
    );
 
    if (!actualizada) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
 
    res.json(actualizada);
 
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: 'Estado no válido', detalle: errores });
    }
    res.status(500).json({ error: 'Error al actualizar el estado', detalle: error.message });
  }
});
 
// ── PATCH /api/alertas/:id/operador ──────────────────────────────────────────
// Asigna un operador a la alerta
// Body: { "operador": "diego" }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/operador', [
  body('operador').isLength({ min: 1, max: 50 }).trim().escape().withMessage('Operador requerido y debe ser menor a 50 caracteres'),
], async (req, res) => {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos no válidos', detalle: errors.array() });
  }

  const { operador } = req.body;

  try {
    const actualizada = await Alerta.findByIdAndUpdate(
      req.params.id,
      { operador },
      { new: true }
    );
 
    if (!actualizada) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
 
    res.json(actualizada);
 
  } catch (error) {
    res.status(500).json({ error: 'Error al asignar operador', detalle: error.message });
  }
});
 
// ── DELETE /api/alertas/:id ───────────────────────────────────────────────────
// Elimina una alerta por ID
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ error: 'ID no válido' });
  }
 
  try {
    const eliminada = await Alerta.findByIdAndDelete(req.params.id);
 
    if (!eliminada) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
 
    res.json({ mensaje: 'Alerta eliminada correctamente', id: req.params.id });
 
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la alerta', detalle: error.message });
  }
});
 
module.exports = router;
