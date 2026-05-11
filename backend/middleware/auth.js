// backend/middleware/auth.js
// Fase 6 — Autenticacion JWT para uso domestico
// Un unico usuario admin configurado por variables de entorno

const jwt = require('jsonwebtoken');

const JWT_SECRET  = process.env.JWT_SECRET  || 'cambia_esto_en_produccion_obligatorio';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// Verificar token en cabecera Authorization: Bearer <token>
function requireAuth(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
        return res.status(401).json({ error: 'Token requerido. Inicia sesion primero.' });
  }

  try {
        req.usuario = jwt.verify(token, JWT_SECRET);
        next();
  } catch (err) {
        const msg = err.name === 'TokenExpiredError'
          ? 'Sesion expirada, vuelve a iniciar sesion'
                : 'Token no valido';
        return res.status(401).json({ error: msg });
  }
}

// Generar token (usado en POST /api/auth/login)
function generarToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

module.exports = { requireAuth, generarToken };
