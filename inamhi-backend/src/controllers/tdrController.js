const db = require('../config/db');

// 1. OBTENER CATALOGOS
exports.getCatalogos = async (req, res) => {
    try {
        const procesos = await db.query('SELECT * FROM cat_tipos_proceso WHERE activo = true');
        const direcciones = await db.query('SELECT * FROM cat_direcciones WHERE activo = true');
        
        res.json({
            tiposProceso: procesos.rows,
            direcciones: direcciones.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar catálogos TDR' });
    }
};

// 2. OBTENER LISTA (Solo los NO eliminados)
exports.getTDRs = async (req, res) => {
    try {
        const sql = `
            SELECT t.*, 
                   cat.nombre_proceso, 
                   dir.nombre_direccion,
                   est.nombre_estado, est.color_hex
            FROM tdr t
            LEFT JOIN cat_tipos_proceso cat ON t.id_tipo_proceso = cat.id_tipo_proceso
            LEFT JOIN cat_direcciones dir ON t.id_direccion_solicitante = dir.id_direccion
            LEFT JOIN cat_estados_tdr est ON t.id_estado = est.id_estado
            WHERE t.eliminado_logico = false  -- FILTRO IMPORTANTE
            ORDER BY t.id_tdr DESC
        `;
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener TDRs' });
    }
};

// 3. CREAR NUEVO TDR
exports.createTDR = async (req, res) => {
    const d = req.body;
    try {
        const numero_tdr = d.numero_tdr || `TDR-${Date.now()}`;
        const anio_fiscal = d.anio_fiscal || new Date().getFullYear();
        const id_tipo_proceso = d.id_tipo_proceso;
        const id_direccion_solicitante = d.id_direccion_solicitante;
        const objeto_contratacion = d.objeto_contratacion || 'Sin Objeto';
        const presupuesto_referencial = d.presupuesto_referencial || 0;
        const partida_presupuestaria = d.partida_presupuestaria || '';
        const fecha_inicio = d.fecha_inicio_contrato || null;
        const fecha_fin = d.fecha_fin_contrato || null;
        const id_usuario_responsable = d.id_usuario || 1; 

        // Estado Borrador por defecto (1)
        let id_estado = 1;

        const sql = `
            INSERT INTO tdr 
            (numero_tdr, anio_fiscal, id_tipo_proceso, id_direccion_solicitante, 
             id_usuario_responsable, usuario_registro_id, 
             id_estado, objeto_contratacion, 
             presupuesto_referencial, partida_presupuestaria, 
             fecha_inicio_contrato, fecha_fin_contrato)
            VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *
        `;

        const values = [numero_tdr, anio_fiscal, id_tipo_proceso, id_direccion_solicitante, id_usuario_responsable, id_estado, objeto_contratacion, presupuesto_referencial, partida_presupuestaria, fecha_inicio, fecha_fin];

        const result = await db.query(sql, values);
        res.json({ message: 'TDR creado', tdr: result.rows[0] });

    } catch (error) {
        console.error("Error createTDR:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// 4. ACTUALIZAR TDR (¡NUEVO!)
exports.updateTDR = async (req, res) => {
    const { id } = req.params;
    const d = req.body;
    
    try {
        const sql = `
            UPDATE tdr SET
                objeto_contratacion = $1,
                presupuesto_referencial = $2,
                partida_presupuestaria = $3,
                fecha_inicio_contrato = $4,
                fecha_fin_contrato = $5,
                id_tipo_proceso = $6,
                id_direccion_solicitante = $7
            WHERE id_tdr = $8
            RETURNING *
        `;
        
        const values = [
            d.objeto_contratacion,
            d.presupuesto_referencial,
            d.partida_presupuestaria,
            d.fecha_inicio_contrato,
            d.fecha_fin_contrato,
            d.id_tipo_proceso,
            d.id_direccion_solicitante,
            id
        ];

        const result = await db.query(sql, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'TDR no encontrado' });
        }

        res.json({ message: 'TDR actualizado correctamente', tdr: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar TDR' });
    }
};

// 5. ELIMINAR TDR (LOGICO) (¡NUEVO!)
exports.deleteTDR = async (req, res) => {
    const { id } = req.params;
    try {
        // CAMBIO IMPORTANTE: Usamos DELETE para borrarlo de verdad
        const sql = 'DELETE FROM tdr WHERE id_tdr = $1 RETURNING id_tdr'; 
        
        const result = await db.query(sql, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'TDR no encontrado' });
        }

        res.json({ message: 'TDR eliminado permanentemente de la base de datos' });
    } catch (error) {
        console.error(error);
        // OJO: Si el TDR ya tiene contratos creados, la base de datos podría impedirte borrarlo
        // por seguridad (Foreign Key Constraint).
        res.status(500).json({ error: 'Error al eliminar: Es posible que este TDR tenga datos asociados.' });
    }
};
// 6. OBTENER TDR POR ID (AGREGA ESTO AL FINAL)
exports.getTdrById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM tdr WHERE id_tdr = $1';
        const result = await db.query(sql, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'TDR no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar TDR por ID' });
    }
};