require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importaciones
const authRoutes = require('./routes/authRoutes');
const tdrRoutes = require('./routes/tdrRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // <--- Verifica esta línea

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tdrs', tdrRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/usuarios', usuarioRoutes); // <--- Verifica esta línea

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR REAL CORRIENDO EN PUERTO ${PORT}`);
});