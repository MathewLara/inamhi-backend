const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// IMPORTACIÓN CORRECTA: Usamos destructuring {} porque tu middleware usa "exports.verificarToken"
const { verificarToken } = require('../middleware/authMiddleware');

// Diagnóstico (opcional, para que veas en consola si cargó bien)
if (typeof verificarToken !== 'function') {
    console.error("🔥 ERROR FATAL: No se pudo importar 'verificarToken'. Revisa el middleware.");
}

// Rutas protegidas con TU middleware
router.get('/', verificarToken, usuarioController.getUsuarios);
router.post('/', verificarToken, usuarioController.createUsuario);
router.put('/:id/password', verificarToken, usuarioController.cambiarPassword);
router.delete('/:id', verificarToken, usuarioController.deleteUsuario);

module.exports = router;