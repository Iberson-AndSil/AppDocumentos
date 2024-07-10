const mongoose = require('mongoose');

const aceptaSchema = new mongoose.Schema({
    codigoDocumento: String,
    descripcionDocumento: String,
    nombreEmisor: String
});

const aceptaModel = mongoose.model('Acepta', aceptaSchema);

module.exports = { aceptaModel };
