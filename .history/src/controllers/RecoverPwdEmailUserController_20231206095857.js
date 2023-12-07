const RecoverPwdEmailUseCase = require('../usecases/RecoverPwdEmailUseCase/RecoverPwdEmail.usecase')
const jwt = require('jsonwebtoken')
const { log } = require('console')

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
      this.logService.execute('AuthServiceRecoverPwdEmail', result.error.message, 'error')
      if (result.error.message === 'Email not found in database') {
        return res.status(400).json({ error: result.error.message })
      }
      return res.status(500).json({ error: result.error.message })
    }
    const token = jwt.sign(result.data, this.secret, { expiresIn: '2h' })
    this.logService.execute('AuthServiceRecoverPwdEmail', `${result.data.email} logs in`, 'info')

    return res.status(200).json({ token })
  }
}

module.exports = RecoverPwdEmailController
