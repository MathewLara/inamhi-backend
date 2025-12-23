const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Helper de auditoría
const auditar = async (req, accion, tabla, idAfectado, datosNuevos, datosAnteriores = null) => {
    try {
        const idUsuario = req.usuario ? req.usuario.id : 1; 
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
        await db.query(
            `INSERT INTO auditoria_logs (id_usuario, accion, tabla_afectada, id_registro_afectado, datos_nuevos, datos_anteriores, ip_origen) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [idUsuario, accion, tabla, idAfectado, datosNuevos, datosAnteriores, ip]
        );
    } catch (e) { console.error("Error auditoría:", e.message); }
};

// 1. LISTAR
exports.getUsuarios = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id_usuario, u.username, u.nombres, u.apellidos, u.email, u.cargo, r.nombre_rol, u.activo
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.eliminado = false ORDER BY u.id_usuario ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

// 2. CREAR
exports.createUsuario = async (req, res) => {
    try {
        const { username, password, nombres, apellidos, email, id_rol, cargo } = req.body;
        // Validación básica
        if(!username || !password) return res.status(400).json({error: 'Faltan datos'});

        const hash = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO usuarios (username, password_hash, nombres, apellidos, email, id_rol, cargo, activo, eliminado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, false)
            RETURNING id_usuario, username
        `;
        const result = await db.query(sql, [username, hash, nombres, apellidos, email, id_rol, cargo]);
        const nuevo = result.rows[0];

        await auditar(req, 'CREAR', 'USUARIOS', nuevo.id_usuario, { username: nuevo.username });
        res.json({ message: 'Usuario creado', usuario: nuevo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};

// 3. CAMBIAR CLAVE
exports.cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { nuevaPassword } = req.body;
        const hash = await bcrypt.hash(nuevaPassword, 10);
        await db.query("UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2", [hash, id]);
        
        await auditar(req, 'ACTUALIZAR', 'USUARIOS', id, { accion: 'Cambio Password' });
        res.json({ message: 'Clave actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar clave' });
    }
};

// 4. ELIMINAR
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("UPDATE usuarios SET eliminado = true WHERE id_usuario = $1", [id]);
        await auditar(req, 'ELIMINAR', 'USUARIOS', id, null, { id_borrado: id });
        res.json({ message: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar' });
    }
};