const express = require('express');
const router = express.Router();
const tdrController = require('../controllers/tdrController');
const jwt = require('jsonwebtoken');

// --- MIDDLEWARE DE SEGURIDAD (REQUERIMIENTO 2.1) ---
const esAdminMiddleware = (req, res, next) => {
    // 1. Obtenemos el token del encabezado Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token no proporcionado' });
    }

    try {
        // 2. Verificamos el token (Usa la misma clave que en authController)
        const decoded = jwt.verify(token, 'SECRETO_SUPER_SECRETO');
        
        // 3. Validamos si el rol es Administrador
        // Comparamos con el valor exacto de tu base de datos
        if (decoded.rol === 'Administrador' || decoded.rol === 'admin') {
            next(); // Es admin, puede continuar
        } else {
            return res.status(403).json({ 
                message: 'Permiso denegado: Solo el Administrador puede realizar esta acción' 
            });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// --- RUTAS DEL SISTEMA ---

// Ruta para catálogos (Acceso para todos)
router.get('/catalogos', tdrController.getCatalogos);

// Listar y Ver detalle (Acceso para todos)
router.get('/', tdrController.getTDRs);
router.get('/:id', tdrController.getTdrById);

// RUTAS PROTEGIDAS: Solo Administrador puede Crear, Modificar o Eliminar
router.post('/', esAdminMiddleware, tdrController.createTDR);
router.put('/:id', esAdminMiddleware, tdrController.updateTDR);
router.delete('/:id', esAdminMiddleware, tdrController.deleteTDR);

module.exports = router;