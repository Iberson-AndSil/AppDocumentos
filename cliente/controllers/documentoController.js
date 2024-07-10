const axios = require('axios');
const { consumeEstado } = require('../services/rabbitmqService');

const documentos = [];

const getDocumentos = (req, res) => {
    res.json(documentos);
};

const postDocumento = async (req, res) => {
    const { idDocumento, descripcion, nombreRemitente } = req.body;
    consumeEstado(idDocumento);

    try {
        const documento = { idDocumento, descripcion, nombreRemitente };
        documentos.push(documento);

        try {
            const response = await axios.post('http://localhost:8081/acepta', {
                codigoDocumento: documento.idDocumento,
                descripcionDocumento: documento.descripcion,
                nombreEmisor: documento.nombreRemitente
            });
            console.log("enviado exitosamente...");
            res.send('Documento enviado exitosamente');
        } catch (error) {
            console.error('Error en la llamada a la API de acepta:', error.message);
            res.status(500).json({ error: 'Error al procesar el documento' });
        }
    } catch (error) {
        console.error('Error al guardar el documento en la base de datos en memoria:', error.message);
        res.status(500).json({ message: 'Error al guardar el documento en la base de datos en memoria' });
    }
};

module.exports = {
    getDocumentos,
    postDocumento
};
