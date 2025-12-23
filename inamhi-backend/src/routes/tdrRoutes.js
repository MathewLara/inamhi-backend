const express = require('express');
const router = express.Router();
const tdrController = require('../controllers/tdrController');

// Ruta para catálogos
router.get('/catalogos', tdrController.getCatalogos);

// Rutas CRUD
router.get('/', tdrController.getTDRs);
router.get('/:id', tdrController.getTdrById); // <--- ¡ESTA ES LA QUE FALTA! AGRÉGALA
router.post('/', tdrController.createTDR);
router.put('/:id', tdrController.updateTDR);
router.delete('/:id', tdrController.deleteTDR);

module.exports = router;