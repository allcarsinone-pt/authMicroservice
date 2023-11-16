const amqplib = require('amqplib')

class LogService {
  static async execute (log , queueName = 'log') {
    const connection = await amqplib.connect(process.env.RABBIT_MQ_URI || 'amqp://localhost:5672')
    const channel = await connection.createChannel()
    await channel.assertQueue(queueName)
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(log)))
  }
}

module.exports = LogService
