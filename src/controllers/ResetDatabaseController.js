const LoginUseCase = require('../usecases/LoginUseCase/Login.usecase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
class ResetDatabaseController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.logService = logService
  }

  async execute (req, res) {
    try {
    await this.userRepository.resetdatabase()
    await LogService.execute({ from: 'authService', data: `users database reseted`, date: new Date(), status: 'info' }, this.logService)
    return res.status(200).json({message: 'Database reset' })
    } catch (error) {
      await LogService.execute({ from: 'authService', data: error.message, date: new Date(), status: 'error' }, this.logService)
      return res.status(500).json({ error: error.message })
    }
  }
}

module.exports = ResetDatabaseController