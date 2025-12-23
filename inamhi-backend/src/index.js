require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. IMPORTAR RUTAS (Desde la carpeta de ADENTRO)
const tdrRoutes = require('./routes/tdrRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const contratoRoutes = require('./routes/contratoRoutes'); // <--- La clave

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. CONEXIÓN BDD (Si la usas aquí)
// const { Pool } = require('pg'); ...

// 3. RUTAS
app.post('/api/auth/login', async (req, res) => {
    res.json({ token: '123', usuario: { id: 1, nombre: 'Admin', rol: 'admin' } });
});

// RUTAS PRINCIPALES
app.use('/api/tdrs', tdrRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/contratos', contratoRoutes); // <--- ¡Esto arregla el 404!

// 4. INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor CORRIENDO en puerto ${PORT} (El archivo correcto)`);
});