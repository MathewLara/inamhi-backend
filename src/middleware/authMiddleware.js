const jwt = require('jsonwebtoken');

// 1. Verificar si tiene un Token válido
exports.verificarToken = (req, res, next) => {
    // Aceptamos token con o sin mayúsculas en el header
    const tokenHeader = req.header('Authorization') || req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(401).json({ msg: '⛔ Acceso denegado, falta el token' });
    }

    try {
        // Limpiamos el "Bearer " si viene
        let token = tokenHeader;
        if (tokenHeader.startsWith('Bearer ')) {
            token = tokenHeader.slice(7, tokenHeader.length);
        }

        // AJUSTE 1: Usamos la misma clave que pusiste en el Login (authController)
        // Si usas process.env.JWT_SECRET, asegúrate de que el Login también lo use.
        // Por ahora, lo dejo fijo para garantizar que te funcione YA.
        const verified = jwt.verify(token, 'SECRETO_SUPER_SECRETO');
        
        // AJUSTE 2: Cambiamos req.user -> req.usuario
        // (Porque tus controladores de TDR y Auditoría buscan req.usuario.id)
        req.usuario = verified;
        
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: '⛔ Token no válido' });
    }
};

// 2. Permitir SOLO a Jefes (Admin y Técnicos)
exports.esJefe = (req, res, next) => {
    // Ajuste: req.usuario en lugar de req.user
    const rol = req.usuario.rol; 
    
    // Validamos si es Admin o Técnico (ajusta los nombres según tu DB exacta)
    if (rol === 'Administrador' || rol === 'Técnico' || rol === 'admin') {
        next(); 
    } else {
        res.status(403).json({ msg: '⛔ Acceso denegado: Permisos insuficientes' });
    }
};