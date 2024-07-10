module.exports = {
    mongoURI: 'mongodb+srv://silvaiberson3:iberson123@cluster0.j8pegzx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    rabbitMQ: {
        protocol: 'amqp',
        hostname: '127.0.0.1',
        port: 5672,
        username: 'Iberson',
        password: 'iberson123',
        vhost: '/',
        authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL']
    }
};
