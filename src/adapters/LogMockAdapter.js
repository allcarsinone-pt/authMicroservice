class LogMockAdapter {
  async execute (context, message, levelType) {
    console.log({ context, message, timestamp: Date.now(), level: levelType })
  }
}

module.exports = LogMockAdapter
