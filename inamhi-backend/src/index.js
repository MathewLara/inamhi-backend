require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const tdrRoutes = require('./routes/tdrRoutes');

// 1. IMPORTAR LAS RUTAS
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/tdrs', tdrRoutes);

// 2. CONEXIÓN BASE DE DATOS
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// 3. RUTAS GENERALES
app.post('/api/auth/login', async (req, res) => {
    res.json({ token: '123', usuario: { id: 1, nombre: 'Admin', rol: 'admin' } });
});

app.get('/api/catalogos', async (req, res) => {
    res.json({
        areas: [{ id_direccion: 1, nombre_direccion: 'Tecnología' }],
        supervisores: [{ id_usuario: 1, nombre_completo: 'Supervisor' }]
    });
});

// 4. RUTAS DE CONTRATOS (Directas)
app.get('/api/contratos', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM contratos ORDER BY id_contrato DESC");
        res.json(result.rows);
    } catch (e) { res.status(500).send(e.message); }
});

app.post('/api/contratos', async (req, res) => {
    // ... Tu lógica de contratos ...
    res.json({ mensaje: 'Guardado' });
});

// 5. CONECTAR MANTENIMIENTOS (Aquí usamos el archivo del Paso 1)
app.use('/api/mantenimientos', mantenimientoRoutes);

// 6. PRENDER SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor CORRIENDO en puerto ${PORT}`);
});