const mongoose = require('mongoose');
const { aceptaSchema } = require('./schemas');

const aceptaModel = mongoose.model('acepta', aceptaSchema);

module.exports = {aceptaModel};