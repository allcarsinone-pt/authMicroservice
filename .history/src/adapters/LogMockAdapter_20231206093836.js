class LogMockAdapter {
  async execute (service, message, levelType) {
    console.log({ service: service, message: message, timestamp: new Date(), level: levelType})
  }
}

module.exports = LogMockAdapter
