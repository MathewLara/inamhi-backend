const db = require('../config/db');
const bcrypt = require('bcryptjs'); 

// 1. VER TODOS LOS USUARIOS
exports.getUsuarios = async (req, res) => {
    try {
        // Traemos todo MENOS la contraseña
        const result = await db.query('SELECT id, nombre, username, rol, email FROM usuarios ORDER BY id ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// 2. EDITAR USUARIO (Y CONTRASEÑA SI ES NECESARIO)
exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, username, rol, email, password } = req.body;

        // ¿El admin escribió una nueva contraseña?
        if (password && password.trim() !== '') {
            // SI: La encriptamos y actualizamos todo
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            
            const sql = `UPDATE usuarios SET nombre=$1, username=$2, rol=$3, email=$4, password=$5 WHERE id=$6`;
            await db.query(sql, [nombre, username, rol, email, hash, id]);
        } else {
            // NO: Actualizamos datos pero NO tocamos la contraseña vieja
            const sql = `UPDATE usuarios SET nombre=$1, username=$2, rol=$3, email=$4 WHERE id=$5`;
            await db.query(sql, [nombre, username, rol, email, id]);
        }

        res.json({ message: 'Usuario actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};