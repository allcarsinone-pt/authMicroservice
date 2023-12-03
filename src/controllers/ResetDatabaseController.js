const LoginUseCase = require('../usecases/LoginUseCase/Login.usecase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')

class ResetDatabaseController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.logService = LogService
  }

  async execute (req, res) {
    try {
    await this.userRepository.resetdatabase()
    this.logService.execute("AuthServiceResetDatabase", 'Users database reset.', "info")
    return res.status(200).json({message: 'Database reset' })
    } catch (error) {
      this.logService.execute("AuthServiceResetDatabase", error.message, "error")
      return res.status(500).json({ error: error.message })
    }
  }
}

module.exports = ResetDatabaseController