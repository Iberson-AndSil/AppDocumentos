const amqp = require("amqplib");
const config = require('../config/config');
const { aceptaModel } = require('../models/aceptaModel');

const rabbitSettings = {
    protocol: 'amqp',
    hostname: config.rabbitMQ.hostname,
    port: config.rabbitMQ.port,
    username: config.rabbitMQ.username,
    password: config.rabbitMQ.password,
    vhost: config.rabbitMQ.vhost,
    authMechanism: config.rabbitMQ.authMechanism
};

// encolar información que llega de los clientes (informacion de documenteos)...
async function encolarMensaje(queue, message) {
    try {
        const conn = await amqp.connect(rabbitSettings);
        const channel = await conn.createChannel();
        console.log("Mensaje enviado a la cola desde el cliente...");

        await channel.assertQueue(queue, { durable: true });
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        await channel.close();
        await conn.close();
    } catch (error) {
        console.error("Error encolando el mensaje:", error);
    }
}

// consumir mensajes que se encolaron en la función anterior...
async function consumirMensajes(queue) {
    try {
        const conn = await amqp.connect(rabbitSettings);
        console.log("Conexión creada para consumidor...");
        const channel = await conn.createChannel();
        console.log("Canal creado para consumidor...");

        await channel.assertQueue(queue, { durable: true });
        await channel.prefetch(1);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                await procesarMensaje(msg, channel);
            }
        });
    } catch (error) {
        console.error("Error consumiendo el mensaje:", error);
    }
}

// funcion para manejar los tiempos de revision aleatorios por cada documento de la cola...
async function procesarMensaje(msg, channel) {
    const mensaje = JSON.parse(msg.content.toString());
    console.log("Consumiendo mensaje:", mensaje);

    const intervalo = Math.floor(Math.random() * 60000);
    console.log(`Procesando mensaje en ${intervalo / 1000} segundos...`);

    setTimeout(async () => {
        const model = new aceptaModel({ 
            codigoDocumento: mensaje.codigoDocumento, 
            descripcionDocumento: mensaje.descripcionDocumento, 
            nombreEmisor: mensaje.nombreEmisor 
        });

        try {
            await model.save();
            console.log("Modelo guardado en la base de datos");

            await encolarMensaje("respuesta", { codigoDocumento: mensaje.codigoDocumento, estado: "aceptado" });
            channel.ack(msg);
        } catch (error) {
            console.error("Error al guardar el modelo en la base de datos:", error);
            channel.nack(msg);
            await encolarMensaje("respuesta", { codigoDocumento: mensaje.codigoDocumento, estado: "cancelado" });
        }
    }, intervalo);
}

module.exports = {
    encolarMensaje,
    consumirMensajes
};
