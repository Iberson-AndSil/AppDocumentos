const mongoose = require('mongoose');
const aceptaSchema = new mongoose.Schema({
    codigoDocumento: {
        type: String,
        required: true
    },
    descripcionDocumento: {
      type: String,
      required: true
    },
    nombreEmisor: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  module.exports = {aceptaSchema}