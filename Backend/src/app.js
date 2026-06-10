const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (firmas, logo)
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

app.use('/api', require('./routes/index'));

app.get('/', (req, res) => res.json({ message: 'Consultorio API running' }));

module.exports = app;
