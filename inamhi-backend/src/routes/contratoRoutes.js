const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');

// --- SEGURIDAD ---
// Importamos el middleware que creamos en el paso anterior.
// verificarToken: Se asegura de que el usuario haya hecho login.
// esJefe: Se asegura de que el usuario sea Admin o Técnico (bloquea a Operativos).
const { verificarToken, esJefe } = require('../middleware/authMiddleware');


// --- RUTAS GET (LECTURA) ---

// Listar contratos: ¿Quieres que el Operativo vea la lista? 
// Si sí, dejamos solo verificarToken. Si no, agrega esJefe.
// Aquí asumo que todos los empleados logueados pueden ver la lista.
router.get('/', verificarToken, contratoController.getContratos);

router.get('/catalogos', verificarToken, contratoController.getCatalogos);

// Ver archivos de un contrato
router.get('/:idContrato/entregables', verificarToken, contratoController.getEntregables);

// Descargar PDF
router.get('/descargar/:nombreArchivo', verificarToken, contratoController.descargarArchivo);


// --- RUTAS POST (CREACIÓN) ---

// Crear Contrato: ESTO ES CRÍTICO. Solo Admin/Técnico deben poder hacerlo.
// Agregamos 'esJefe' para bloquear a los Operativos.
router.post('/', verificarToken, esJefe, contratoController.createContrato);

// RUTA DE SUBIDA DE ARCHIVOS (Evidencias/PDFs)
// El Operativo SÍ debe poder usar esto, por eso NO ponemos 'esJefe', solo 'verificarToken'.
router.post('/upload', verificarToken, contratoController.uploadMiddleware, contratoController.subirEntregable);


// --- RUTAS DELETE Y PUT (MODIFICACIÓN/ELIMINACIÓN) ---

// Eliminar contrato: Solo Admin/Técnico.
router.delete('/:id', verificarToken, esJefe, contratoController.deleteContrato);

// Cambiar estado: Solo Admin/Técnico.
router.put('/:id/estado', verificarToken, esJefe, contratoController.updateEstado);


module.exports = router;