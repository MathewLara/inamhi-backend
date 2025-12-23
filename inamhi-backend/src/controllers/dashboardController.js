const db = require('../config/db');

exports.getResumen = async (req, res) => {
    try {
        // 1. Contamos cuántos contratos hay en total
        const sqlContratos = 'SELECT COUNT(*) FROM contratos_profesionales';
        const respuestaContratos = await db.query(sqlContratos);
        
        // 2. Aquí prepararemos los otros contadores (TDR, Mantenimiento) en el futuro
        // Por ahora los dejamos en 0 hasta que crees esas tablas
        
        res.json({
            totalContratos: respuestaContratos.rows[0].count,
            totalTDRs: 0,         // Pendiente
            totalMantenimientos: 0 // Pendiente
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen del dashboard' });
    }
};