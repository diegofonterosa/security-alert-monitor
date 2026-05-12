const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-super-seguro';

// Generar token JWT
const generarToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
};

// Middleware para verificar token JWT (alias: requireAuth)
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
          return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = await Usuario.findById(decoded.id).select('-password');
          if (!req.user) {
                  return res.status(401).json({ error: 'Token invalido. Usuario no encontrado.' });
          }
          next();
    } catch (error) {
          return res.status(403).json({ error: 'Token invalido.' });
    }
};

// Alias para compatibilidad con routes/alertas.js
const requireAuth = authenticateToken;

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

// Middleware opcional: verificar rol (user o admin)
const requireRole = (role) => {
    return (req, res, next) => {
          if (req.user.role !== role) {
                  return res.status(403).json({ error: `Acceso denegado. Se requiere rol '${role}'.` });
          }
          next();
    };
};

module.exports = {
    authenticateToken,
    requireAuth,
    requireAdmin,
    requireRole,
    JWT_SECRET,
    generarToken,
};
