const express = require("express");
const mongoose = require('mongoose');
const aceptaRoutes = require('./routes/aceptaRoutes');
const { consumirMensajes } = require('./services/rabbitmqService');
const config = require('./config/config');

const app = express();
app.use(express.json());
const port = process.env.PORT || 8081;

mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use('/acepta', aceptaRoutes);

app.listen(port, () => {
    console.log(`corriendo servidor en el puerto: ${port}`);
    consumirMensajes("documentos");
});
