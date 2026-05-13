const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Validar que JWT_SECRET esté definido
if (!process.env.JWT_SECRET) {
    console.error('ERROR CRÍTICO: JWT_SECRET no está definido en .env');
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Generar token JWT
const generarToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
          return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
    }

    try {
          const decoded = jwt.verify(token, JWT_SECRET);
          req.user = await Usuario.findById(decoded.id).select('-password');
          if (!req.user) {
                  return res.status(401).json({ error: 'Token inválido. Usuario no encontrado.' });
          }
          next();
    } catch (error) {
          console.error('[AUTH] Token verification failed:', error.message);
          return res.status(403).json({ error: 'Token inválido.' });
    }
};

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
    requireAdmin,
    requireRole,
    generarToken,
    JWT_SECRET,
    JWT_EXPIRES_IN,
};
