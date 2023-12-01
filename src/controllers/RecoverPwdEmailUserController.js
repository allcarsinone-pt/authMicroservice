const RecoverPwdEmailUseCase = require('../usecases/RecoverPwdEmailUseCase/RecoverPwdEmail.usecase')
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')
class RecoverPwdEmailController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
  }

  async execute (req, res) {
    const loginDto = req.body
    const loginUseCase = new RecoverPwdEmailUseCase(this.userRepository)
    const result = await loginUseCase.execute(loginDto)
    if (!result.success) {
      await LogService.execute({ from: 'authService', data: result.error.message, date: new Date(), status: 'error' }, this.logService)
      if (result.error.message === 'Email not found in database') {
        return res.status(400).json({ error: result.error.message })
      }
      return res.status(500).json({ error: result.error.message })
    }
    const token = jwt.sign(result.data, this.secret, { expiresIn: '2h' })
    await LogService.execute({ from: 'authService', data: `${result.data.email} logs in`, date: new Date(), status: 'info' }, this.logService)
    return res.status(200).json({ token })
  }
}

module.exports = RecoverPwdEmailController
