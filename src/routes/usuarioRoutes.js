const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Definimos las rutas
router.get('/', usuarioController.getUsuarios);      // Ver lista
router.put('/:id', usuarioController.updateUsuario); // Editar uno

module.exports = router;