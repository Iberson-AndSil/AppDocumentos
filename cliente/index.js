const express = require('express');
const app = express();
const documentoRoutes = require('./routes/documentoRoutes');
const { consumeEstado } = require('./services/rabbitmqService');

app.use(express.json());
const port = 8080;

app.use('/documento', documentoRoutes);

app.listen(port, () => {
    console.log(`Aplicación de ejemplo escuchando en el puerto ${port}`);
    consumeEstado();
});
