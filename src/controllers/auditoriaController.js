const pool = require('../config/db'); // Asumo que tu conexión está aquí

const obtenerAuditoria = async (req, res) => {
    try {
        const { busqueda, fechaInicio, fechaFin, mostrarEliminados } = req.query;

        // 1. Base de la consulta
        // Hacemos JOIN con usuarios para saber QUIÉN hizo la acción
        let query = `
            SELECT 
                a.id_log,
                a.fecha_evento,
                a.accion,
                a.tabla_afectada,
                a.ip_origen,
                a.navegador_info,
                u.username,
                u.nombres || ' ' || u.apellidos as nombre_usuario_responsable,
                a.datos_nuevos,
                a.datos_anteriores
            FROM auditoria_logs a
            LEFT JOIN usuarios u ON a.id_usuario = u.id_usuario
            WHERE 1=1
        `;

        const values = [];
        let counter = 1;

        // 2. Filtro de Búsqueda Global (Cumple con sección 3.5)
        // Busca en tabla afectada, usuario, Y DENTRO DE LOS JSONs (datos_nuevos/anteriores)
        if (busqueda) {
            query += ` AND (
                a.accion ILIKE $${counter} OR
                a.tabla_afectada ILIKE $${counter} OR
                u.username ILIKE $${counter} OR
                u.nombres ILIKE $${counter} OR
                u.apellidos ILIKE $${counter} OR
                -- Truco de Postgres: Cast a texto para buscar dentro del JSON
                a.datos_nuevos::text ILIKE $${counter} OR 
                a.datos_anteriores::text ILIKE $${counter}
            )`;
            values.push(`%${busqueda}%`);
            counter++;
        }

        // 3. Filtro de Fechas
        if (fechaInicio) {
            query += ` AND DATE(a.fecha_evento) >= $${counter}`;
            values.push(fechaInicio);
            counter++;
        }

        if (fechaFin) {
            query += ` AND DATE(a.fecha_evento) <= $${counter}`;
            values.push(fechaFin);
            counter++;
        }

        // 4. Filtro "Ver Todo lo Eliminado"
        // Si el checkbox del front está activo, mostramos solo ELIMINACIONES
        // Si no, mostramos todo (o puedes ajustar la lógica según prefieras)
        if (mostrarEliminados === 'true') {
            query += ` AND a.accion = 'ELIMINAR'`;
        }

        // 5. Ordenamiento (Lo más reciente primero)
        query += ` ORDER BY a.fecha_evento DESC`;

        // Límite para no saturar (opcional)
        query += ` LIMIT 100`;

        const result = await pool.query(query, values);

        return res.status(200).json({
            ok: true,
            data: result.rows
        });

    } catch (error) {
        console.error('Error en obtenerAuditoria:', error);
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al obtener registros de auditoría'
        });
    }
};

module.exports = {
    obtenerAuditoria
};