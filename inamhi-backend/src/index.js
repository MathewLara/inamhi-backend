require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes'); // <--- IMPORTA ESTO
const tdrRoutes = require('./routes/tdrRoutes');
const mantenimientoRoutes = require('./routes/mantenimientoRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Para las estadísticas

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. USAR LAS RUTAS REALES
app.use('/api/auth', authRoutes); // <--- ESTO REEMPLAZA AL LOGIN FALSO
app.use('/api/tdrs', tdrRoutes);
app.use('/api/mantenimientos', mantenimientoRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/dashboard', dashboardRoutes); // <--- Esto arreglará el error 404 del dashboard

// 3. INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR REAL CORRIENDO EN PUERTO ${PORT}`);
});