const mongoose = require('mongoose');
const { aceptaModel } = require('../models/models');
const config = require('../config/config');

mongoose.connect(config.mongoURI);

//guardar documento en la BD...
async function guardarDocumento(mensaje) {
    try {
        const model = new aceptaModel({ 
            codigoDocumento: mensaje.codigoDocumento, 
            descripcionDocumento: mensaje.descripcionDocumento, 
            nombreEmisor: mensaje.nombreEmisor 
        });

        await model.save();
        console.log("guardado en la base de datos...");
    } catch (error) {
        console.error("Error al guardar en la BD...", error);
        throw error;
    }
}

module.exports = {guardarDocumento};
