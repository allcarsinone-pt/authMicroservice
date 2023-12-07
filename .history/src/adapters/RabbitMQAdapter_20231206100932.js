const amqplib = require('amqplib')
class RabbitMQAdapter {
  constructor (baseURI) {
    this.baseURI = baseURI
  }
  /**
     * @param {object} log
     * @param {string} queueName
     * @return {Promise<void>}
     */

  async execute (log, queueName = 'log') {
    try {
      const connection = await amqplib.connect(this.baseURI)
      const channel = await connection.createChannel()
      await channel.assertQueue(queueName)
      await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(log)))
    } catch (error) {
      console.log(log)
    }
  }
}

module.exports = RabbitMQAdapter
