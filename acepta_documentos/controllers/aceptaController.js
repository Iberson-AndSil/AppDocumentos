const { encolarMensaje } = require('../services/rabbitmqService');
const { aceptaModel } = require('../models/aceptaModel');

const getAcepta = async (req, res) => {
    try {
        const list = await aceptaModel.find({});
        res.json(list);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const postAcepta = async (req, res) => {
    try {
        const queue = "documentos";
        const { codigoDocumento, descripcionDocumento, nombreEmisor } = req.body;
        const mensaje = { codigoDocumento, descripcionDocumento, nombreEmisor };
        
        await encolarMensaje(queue, mensaje);

        const estado = "en proceso";
        await encolarMensaje("respuesta", { codigoDocumento, estado });

        return res.status(201).json({ message: 'Mensaje encolado correctamente' });
    } catch (error) {
        console.log('Error', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAcepta,
    postAcepta
};
