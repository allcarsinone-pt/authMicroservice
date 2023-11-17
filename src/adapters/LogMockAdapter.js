class LogMockAdapter {
  execute (message, queueName = 'log') {
    console.log(message)
  }
}

module.exports = LogMockAdapter
