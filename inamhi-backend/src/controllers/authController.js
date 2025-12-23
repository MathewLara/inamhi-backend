const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- HELPER: Función para validar formato de email con Expresiones Regulares ---
const esEmailValido = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// 1. REGISTRAR NUEVO USUARIO (Con Validaciones)
exports.registrarUsuario = async (req, res) => {
    const { username, password, nombres, apellidos, email, id_rol } = req.body;

    try {
        // --- VALIDACIÓN 1: CAMPOS OBLIGATORIOS ---
        if (!username || !password || !nombres || !email) {
            return res.status(400).json({ message: '⚠️ Faltan datos obligatorios (username, password, nombres, email).' });
        }

        // --- VALIDACIÓN 2: FORMATO DE CORREO ---
        if (!esEmailValido(email)) {
            return res.status(400).json({ message: '⛔ El formato del correo electrónico no es válido.' });
        }

        // --- VALIDACIÓN 3: SEGURIDAD DE CONTRASEÑA ---
        if (password.length < 6) {
            return res.status(400).json({ message: '⛔ La contraseña es muy débil. Debe tener al menos 6 caracteres.' });
        }

        // --- VALIDACIÓN 4: VERIFICAR DUPLICADOS EN BD ---
        // Verificamos si el username O el email ya existen
        const sqlCheck = "SELECT * FROM usuarios WHERE username = $1 OR email = $2";
        const checkResult = await db.query(sqlCheck, [username, email]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ message: '⛔ El usuario o el correo ya están registrados en el sistema.' });
        }

        // SI PASA TODAS LAS PRUEBAS, PROCEDEMOS:
        
        // 1. Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // 2. Insertar en BD
        const sqlInsert = `
            INSERT INTO usuarios (id_rol, username, password_hash, nombres, apellidos, email, activo)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            RETURNING id_usuario, username, email;
        `;
        
        // Asumimos rol 2 (Técnico) por defecto si no envían rol
        const rolFinal = id_rol || 2; 

        const result = await db.query(sqlInsert, [rolFinal, username, passwordHash, nombres, apellidos, email]);

        res.json({
            message: '✅ Usuario registrado exitosamente',
            usuario: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ... (Mantén tu función de login igual, esa está bien) ...
exports.login = async (req, res) => {
    // ... tu código de login que ya tenías ...
    const { username, password } = req.body;
    
    // VALIDACIÓN BÁSICA EN LOGIN TAMBIÉN
    if (!username || !password) {
        return res.status(400).json({ message: '⚠️ Ingresa usuario y contraseña' });
    }

    // ... (resto del código de login: buscar usuario, comparar hash, generar token) ...
    // COPIA AQUÍ EL CÓDIGO DE LOGIN QUE TE PASÉ ANTES
    try {
        const sql = `SELECT u.*, r.nombre_rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.username = $1 AND u.activo = TRUE`;
        const result = await db.query(sql, [username]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
        const usuario = result.rows[0];
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) return res.status(401).json({ message: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: usuario.id_usuario, rol: usuario.nombre_rol }, 'SECRETO_SUPER_SECRETO', { expiresIn: '8h' });
        res.json({ message: '✅ Bienvenido', token, usuario: { nombre: usuario.nombres, rol: usuario.nombre_rol } });
    } catch (error) {
        res.status(500).json({ error: 'Error server' });
    }
};