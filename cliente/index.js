const express = require('express');
const app = express();
const axios = require('axios');
app.use(express.json());
const port = 8080;
const ampq = require("amqplib"); 

// Base de datos en memoria
const documentos = [];

const rabbitSettings = {
    protocol: 'amqp',
    hostname: 'localhost', 
    port: 5672,
    username: 'Iberson',
    password: 'iberson123',
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
}


async function consumeEstado(consumidor) {
    const queue = "respuesta";
    try {
        const conn = await ampq.connect(rabbitSettings);
        // console.log("conexion creada...");
        
        const channel = await conn.createChannel();
        // console.log("channel creado...");
        
        const res = await channel.assertQueue(queue);
        // console.log("Queue creado..."); 
        
        console.log(`Esperando mensajes de... ${consumidor}`);
        channel.consume(queue, message => {
            let respuesta = JSON.parse(message.content.toString());
            console.log(`Recibido: ${respuesta.cosigo}`);
            console.log(respuesta);
            
            if (respuesta.codigo == consumidor) {
                channel.ack(message);
                console.log("Mensaje eliminado de la cola...");
            } else {
                console.log("Este mensaje no es para este consumidor...");
            }
        })
        
    } catch (error) {
        console.error('Error en la conexión a RabbitMQ:', error);
    }
}

app.get('/documento', (req, res) => {
    res.json(documentos);
});

app.post('/documento', async (req, res) => {
    const { idDocumento, descripcion, nombreRemitente } = req.body;
    
    consumeEstado(idDocumento)    
    
    try {
        const documento = { idDocumento, descripcion, nombreRemitente };
        documentos.push(documento);
        
        try {
            const response = await axios.post('http://localhost:8081/acepta', {
                codigoDocumento: documento.idDocumento,
                descripcionDocumento: documento.descripcion,
                nombreEmisor: documento.nombreRemitente
            });
            console.log("Enviado exitosamente");
            res.send('Documento enviado exitosamente');
        } catch (error) {
            console.error('Error en la llamada a la API de acepta:', error.message);
            res.status(500).json({ error: 'Error al procesar el documento' });
        }
    } catch (error) {
        console.error('Error al guardar el documento en la base de datos en memoria:', error.message);
        res.status(500).json({ message: 'Error al guardar el documento en la base de datos en memoria' });
    }

});

app.listen(port, () => {
    console.log(`Aplicación de ejemplo escuchando en el puerto ${port}`);
    consumeEstado()
});
