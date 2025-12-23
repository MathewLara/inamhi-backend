const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.registrarUsuario); // <--- NUEVA RUTA SEGURA

// router.get('/crear-admin', ...); // Esta ya no la necesitas tanto, pero puedes dejarla.

module.exports = router;