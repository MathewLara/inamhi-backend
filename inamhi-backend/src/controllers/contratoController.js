const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- CONFIGURACIÓN DE MULTER (Para subir archivos) ---
// Asegúrate de crear la carpeta 'uploads' en la raíz de tu proyecto o ajusta la ruta
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads'); // Sube dos niveles para salir de src/controllers
        // Si la carpeta no existe, la crea (opcional, pero recomendado manejar esto manualmente antes)
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Guarda el archivo con fecha + nombre original para evitar duplicados
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 1. Middleware para usar en la ruta (exportamos el 'single' upload)
exports.uploadMiddleware = upload.single('archivo');


// --- FUNCIONES DEL CONTROLADOR ---

// GET: Obtener todos los contratos
exports.getContratos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contratos ORDER BY id_contrato DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener contratos' });
    }
};

// GET: Obtener catálogos (Ejemplo genérico, ajusta según tus tablas reales)
exports.getCatalogos = async (req, res) => {
    try {
        // Si tienes tablas de catálogos (ej: tipos_contrato), haz las consultas aquí
        // Por ahora devolvemos un objeto vacío para que no falle la ruta
        const tipos = await db.query('SELECT * FROM tipo_contrato'); // Ejemplo
        res.json({
            tiposContrato: tipos.rows,
            // Agrega más catálogos si es necesario
        });
    } catch (error) {
        console.error("Error en catalogos (puede que la tabla no exista):", error.message);
        res.json({ mensaje: "Catálogos no configurados aún" }); 
    }
};

// POST: Crear contrato
exports.createContrato = async (req, res) => {
    const { nombre, descripcion, fecha_inicio, fecha_fin, monto } = req.body;
    try {
        const sql = `
            INSERT INTO contratos (nombre, descripcion, fecha_inicio, fecha_fin, monto, estado)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVO')
            RETURNING *
        `;
        const result = await db.query(sql, [nombre, descripcion, fecha_inicio, fecha_fin, monto]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear contrato' });
    }
};

// POST: Subir Entregable (Lógica de Base de Datos tras subir el archivo físico)
exports.subirEntregable = async (req, res) => {
    // req.file contiene la info del archivo subido por Multer
    // req.body contiene los campos de texto (ej: id_contrato, descripcion)
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const { id_contrato, descripcion } = req.body;
    const { filename, originalname, path: filePath, size } = req.file;

    try {
        // 1. Insertar en tabla repositorio_archivos (o como se llame tu tabla de archivos)
        const sqlArchivo = `
            INSERT INTO repositorio_archivos (nombre_original, nombre_almacenado, ruta, extension, tamano)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id_archivo
        `;
        const ext = path.extname(originalname);
        const resultArchivo = await db.query(sqlArchivo, [originalname, filename, filePath, ext, size]);
        const idArchivo = resultArchivo.rows[0].id_archivo;

        // 2. Relacionar con el contrato en entregables_contrato
        const sqlEntregable = `
            INSERT INTO entregables_contrato (id_contrato, id_archivo, descripcion, fecha_subida)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;
        const resultEntregable = await db.query(sqlEntregable, [id_contrato, idArchivo, descripcion]);

        res.status(201).json({
            message: 'Entregable subido correctamente',
            entregable: resultEntregable.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar información del entregable' });
    }
};

// DELETE: Eliminar contrato (Borrado lógico)
exports.deleteContrato = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("UPDATE contratos SET estado = 'INACTIVO' WHERE id_contrato = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
        res.json({ message: 'Contrato eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
};

// PUT: Actualizar estado
exports.updateEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // Ej: 'FINALIZADO', 'ACTIVO'
    try {
        const result = await db.query('UPDATE contratos SET estado = $1 WHERE id_contrato = $2 RETURNING *', [estado, id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// GET: Obtener entregables de un contrato
exports.getEntregables = async (req, res) => {
    const { idContrato } = req.params;
    try {
        const sql = `
            SELECT e.*, r.nombre_original, r.nombre_almacenado
            FROM entregables_contrato e
            JOIN repositorio_archivos r ON e.id_archivo = r.id_archivo
            WHERE e.id_contrato = $1
            ORDER BY e.fecha_subida DESC
        `;
        const result = await db.query(sql, [idContrato]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener entregables' });
    }
};

// GET: Descargar archivo
exports.descargarArchivo = async (req, res) => {
    const { nombreArchivo } = req.params;
    
    // NOTA: Ajusta esta ruta si tu carpeta 'uploads' está en otro lado
    const rutaArchivo = path.join(__dirname, '../../uploads', nombreArchivo);

    res.download(rutaArchivo, (err) => {
        if (err) {
            console.error("Error en descarga:", err);
            // Si ya se enviaron cabeceras, no podemos enviar otro error JSON
            if (!res.headersSent) {
                res.status(404).json({ error: 'Archivo no encontrado o eliminado' });
            }
        }
    });
};