const amqplib = require('amqplib')

class RabbitMQLogAdapter {
    constructor (baseURI) {
        this.baseURI = baseURI
    }
    async execute (context, message, levelType) {
        const connection = await amqplib.connect(this.baseURI)
        const channel = await connection.createChannel()
        await channel.assertQueue('logs')       
        await channel.sendToQueue('logs', Buffer.from(JSON.stringify({ context, message, timestamp: Date.now() ,level: levelType})))
    }
  }

module.exports = RabbitMQLogAdapter