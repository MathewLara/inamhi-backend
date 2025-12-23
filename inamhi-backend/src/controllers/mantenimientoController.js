const db = require('../config/db'); 

// 1. OBTENER LISTA
exports.getMantenimientos = async (req, res) => {
    try {
        console.log("🔍 [Backend] Consultando tabla soporte_mantenimientos...");
        
        // IMPORTANTE: Asegúrate de que la tabla se llama 'soporte_mantenimientos'
        const sql = 'SELECT * FROM soporte_mantenimientos ORDER BY fecha_reporte DESC';
        
        const result = await db.query(sql);
        console.log(`✅ [Backend] Encontrados: ${result.rows.length} registros.`);
        res.json(result.rows);
    } catch (error) {
        console.error('🔥 [Backend] Error al obtener:', error.message);
        res.status(500).json({ error: 'Error al obtener mantenimientos' });
    }
};

// 2. CREAR NUEVO REPORTE
exports.createMantenimiento = async (req, res) => {
    try {
        const { 
            nombre_equipo, descripcion_fallo, fecha_reporte, tecnico_sugerido, id_usuario_reporta 
        } = req.body;
        
        const fechaFinal = fecha_reporte || new Date();
        const usuarioFinal = id_usuario_reporta || 1; 

        const sql = `
            INSERT INTO soporte_mantenimientos 
            (nombre_equipo, descripcion_fallo, fecha_reporte, tecnico_asignado, estado, id_usuario_reporta)
            VALUES ($1, $2, $3, $4, 'PENDIENTE', $5)
            RETURNING *
        `;
        
        const values = [nombre_equipo, descripcion_fallo, fechaFinal, tecnico_sugerido || 'No especificado', usuarioFinal];

        const result = await db.query(sql, values);
        
        console.log("✅ Reporte guardado:", result.rows[0].id_mantenimiento);
        res.json(result.rows[0]);

    } catch (error) {
        console.error("🔥 Error al crear reporte:", error.message);
        res.status(500).json({ error: 'Error al crear reporte en BD' });
    }
};

// 3. ACTUALIZAR ESTADO
exports.updateEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevoEstado } = req.body;

        let sql = 'UPDATE soporte_mantenimientos SET estado = $1 WHERE id_mantenimiento = $2';
        if (nuevoEstado === 'FINALIZADO' || nuevoEstado === 'Reparado') {
            sql = 'UPDATE soporte_mantenimientos SET estado = $1, fecha_resolucion = NOW() WHERE id_mantenimiento = $2';
        }
        
        await db.query(sql, [nuevoEstado, id]);
        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};