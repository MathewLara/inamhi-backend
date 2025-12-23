const express = require('express');
const router = express.Router();

// Importamos el controlador que acabas de arreglar
const authController = require('../controllers/authController');

// Definimos las rutas usando las funciones que exportaste
// Fíjate que usamos authController.registrarUsuario y authController.login
router.post('/register', authController.registrarUsuario);
router.post('/login', authController.login);

module.exports = router;