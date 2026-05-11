// backend/routes/auth.js
// Fase 6 — Endpoint de autenticacion JWT
// Login simple con usuario y password desde variables de entorno

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generarToken } = require('../middleware/auth');

// Las credenciales viven en .env (no en base de datos)
// Para generar el hash de tu password:
//   node -e "require('bcryptjs').hash('TU_PASSWORD',10).then(console.log)"
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_HASH = process.env.ADMIN_HASH || '';

// POST /api/auth/login
// Body: { "usuario": "admin", "password": "..." }
router.post('/login', [
    body('usuario').isLength({ min: 1, max: 50 }).trim().escape(),
    body('password').isLength({ min: 1, max: 200 }),
  ], async (req, res) => {

              const errors = validationResult(req);
    if (!errors.isEmpty()) {
          return res.status(400).json({ error: 'Credenciales no validas' });
    }

              const { usuario, password } = req.body;

              // Mismo mensaje para usuario y password incorrectos (no revelar cual falla)
              const usuarioCorrecto = usuario === ADMIN_USER;
    const hashValido = ADMIN_HASH
      ? await bcrypt.compare(password, ADMIN_HASH)
          : false;

              if (!usuarioCorrecto || !hashValido) {
                    return res.status(401).json({ error: 'Usuario o contrasena incorrectos' });
              }

              const token = generarToken({ usuario: ADMIN_USER, rol: 'admin' });

              res.json({
                    token,
                    expira: process.env.JWT_EXPIRES_IN || '8h',
                    usuario: ADMIN_USER,
              });
});

// POST /api/auth/logout
// El logout real es del lado cliente (borrar el token de sessionStorage)
// Este endpoint existe para coherencia de la API
router.post('/logout', (req, res) => {
    res.json({ mensaje: 'Sesion cerrada. Token eliminado del cliente.' });
});

module.exports = router;
