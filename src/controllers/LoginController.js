const LoginUseCase = require('../usecases/LoginUseCase/Login.usecase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



class LoginController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
  }

  async execute (req, res) {
    const loginDto = req.body
    const loginUseCase = new LoginUseCase(this.userRepository)
    const result = await loginUseCase.execute(loginDto, bcrypt.compareSync)
    if (!result.success) {
      this.logService.execute("AuthServiceLogin", result.error.message, "error")

      if (result.error.message === 'Email or password incorrect') {
        return res.status(400).json({ error: result.error.message })
      }
      return res.status(500).json({ error: result.error.message })
    }
    const token = jwt.sign(result.data, this.secret, { expiresIn: '2h' })
    this.logService.execute("AuthServiceLogin", `${result.data.id}-${result.data.role_id} logs in`, "info")
    return res.status(200).json({ token })
  }
}

module.exports = LoginController
