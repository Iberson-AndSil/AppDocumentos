const express = require("express");
const amqp = require("amqplib");
const mongoose = require('mongoose');
const { aceptaModel } = require('./models'); // Asegúrate de que esta importación sea correcta

const uri = 'mongodb+srv://silvaiberson3:iberson123@cluster0.j8pegzx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri);

const app = express();
app.use(express.json());
const port = 8081;

const rabbitSettings = {
    protocol: 'amqp',
    hostname: '127.0.0.1', // Cambiado de 'localhost' a '127.0.0.1'
    port: 5672,
    username: 'Iberson',
    password: 'iberson123',
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
};

// **********************************************************************
// Función para encolar mensajes en RabbitMQ
async function encolarRespuesta(cosigo, init) {
    try {
        const conn = await amqp.connect(rabbitSettings);
        const channel = await conn.createChannel();
        console.log("mensaje enviado a la cola desde el cliente");

        const queue = "respuesta";

        // Asegúrate de que la cola existe
        await channel.assertQueue(queue, { durable: true });

        // Enviar mensaje a la cola
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify({cosigo, init})));
        console.log("Mensaje de respuesta encolado...");

        // Cerrar el canal y la conexión
        await channel.close();
        await conn.close();
    } catch (error) {
        console.error("Error encolando el mensaje:", error);
    }
}

async function post(params) {
    try {
        const response = await axios.post('http://localhost:8081/acepta', {
            codigoDocumento: documento.idDocumento,
            descripcionDocumento: documento.descripcion,
            nombreEmisor: documento.nombreRemitente
        });
    } catch (error) {
        console.error('Error en la llamada a la API de acepta:', error.message);
        res.status(500).json({ error: 'Error al procesar el documento' });
    }
}

// **********************************************************************

// Función para encolar mensajes en RabbitMQ
async function encolarMensaje(queue, message) {
    try {
        const conn = await amqp.connect(rabbitSettings);
        const channel = await conn.createChannel();
        console.log("mensaje enviado a la cola desde el cliente");

        // Asegúrate de que la cola existe
        await channel.assertQueue(queue, { durable: true });

        // Enviar mensaje a la cola
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log("Mensaje encolado...");

        // Cerrar el canal y la conexión
        await channel.close();
        await conn.close();
    } catch (error) {
        console.error("Error encolando el mensaje:", error);
    }
}

async function consumirMensajes(queue) {
    try {
        const conn = await amqp.connect(rabbitSettings);
        console.log("Conexión creada para consumidor...");
        const channel = await conn.createChannel();
        console.log("Canal creado para consumidor...");

        // Asegúrate de que la cola existe
        await channel.assertQueue(queue, { durable: true });

        // Configurar prefetch a 1
        await channel.prefetch(1);

        // Consumir mensajes de la cola
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const mensaje = JSON.parse(msg.content.toString());
                console.log("Consumiendo mensaje:", mensaje);

                // Tiempo aleatorio entre 0 y 10 minutos (0 y 600,000 ms)
                const intervalo = Math.floor(Math.random() * 60000);
                console.log(`Procesando mensaje en ${intervalo / 1000} segundos...`);

                setTimeout(async () => {
                    const model = new aceptaModel({ 
                        codigoDocumento: mensaje.codigoDocumento, 
                        descripcionDocumento: mensaje.descripcionDocumento, 
                        nombreEmisor: mensaje.nombreEmisor 
                    });

                    try {
                        // Guardar el modelo en la base de datos
                        await model.save();
                        console.log("Modelo guardado en la base de datos");

                        await encolarRespuesta(mensaje.codigoDocumento, "aceptado");


                        // Confirmar que el mensaje ha sido recibido
                        channel.ack(msg);
                    } catch (error) {
                        console.error("Error al guardar el modelo en la base de datos:", error);
                        // NACK para reencolar el mensaje en caso de error
                        channel.nack(msg);
                        await encolarRespuesta(mensaje.codigoDocumento, "cancelado");
                    }
                }, intervalo);
            }
        });
    } catch (error) {
        console.error("Error consumiendo el mensaje:", error);
    }
}

app.get('/acepta', async (req, res) => {
    try {
        const list = await aceptaModel.find({});
        res.json(list);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/acepta', async (req, res) => {
    try {
        const queue = "documentos";
        const { codigoDocumento, descripcionDocumento, nombreEmisor } = req.body;
        const mensaje = { codigoDocumento, descripcionDocumento, nombreEmisor };
        
        await encolarMensaje(queue, mensaje);

        const estado = "en proceso";
        await encolarRespuesta(codigoDocumento, estado)

        // Enviar mensaje a la cola

        return res.status(201).json({ message: 'Mensaje encolado correctamente' });
    } catch (error) {
        console.log('Error', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    // Iniciar el consumidor al iniciar el servidor
    consumirMensajes("documentos");
});
