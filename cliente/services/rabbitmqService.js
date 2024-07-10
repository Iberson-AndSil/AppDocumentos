const amqp = require("amqplib");
const rabbitSettings = require('../config/rabbitmq');

async function consumeEstado(consumidor, callback) {
    const queue = "respuesta";
    try {
        const conn = await amqp.connect(rabbitSettings);
        const channel = await conn.createChannel();
        await channel.assertQueue(queue);
        console.log(`Esperando mensajes de... ${consumidor}`);

        channel.consume(queue, message => {
            let respuesta = JSON.parse(message.content.toString());
            console.log(`Recibido: ${respuesta.codigo}`);
            console.log(respuesta);

            if (respuesta.codigo == consumidor) {
                channel.ack(message);
                console.log("Mensaje eliminado de la cola...");
                if (callback) callback(respuesta);
            } else {
                console.log("Este mensaje no es para este consumidor...");
            }
        });
    } catch (error) {
        console.error('Error en la conexión a RabbitMQ:', error);
    }
}

module.exports = {
    consumeEstado
};
