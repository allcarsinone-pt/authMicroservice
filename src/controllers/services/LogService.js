
class LogService {

  static async execute (log, adapter, queueName = 'log') {
    await adapter.execute(log, queueName)
  }
}

module.exports = LogService
