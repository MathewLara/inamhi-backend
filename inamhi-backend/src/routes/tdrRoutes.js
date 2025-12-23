const express = require('express');
const router = express.Router();
const tdrController = require('../controllers/tdrController');

// Ruta para catálogos
router.get('/catalogos', tdrController.getCatalogos);

// Rutas CRUD
router.get('/', tdrController.getTDRs);
router.post('/', tdrController.createTDR);
router.put('/:id', tdrController.updateTDR);    // <-- NUEVO: Para editar
router.delete('/:id', tdrController.deleteTDR); // <-- NUEVO: Para eliminar

module.exports = router;