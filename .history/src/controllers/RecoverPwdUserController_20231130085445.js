const RecoverPwdUserUseCase = require('../usecases/RecoverPwdUseCase/RecoverPwd.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthEmailUseCase/ValidateAuthEmail.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class RecoverPwdUserController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
  }

  /**
     * @description Method to execute http request to changePwd an user
     * @param {*} request request object from express
     * @param {*} response response object from express
     * @returns response object from express
     */

  async execute (req, res) {
    const { token, password, confirmPassword } = req.body

    if (!token || !password || !confirmPassword) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
      return res.status(400).json({ message: 'Missing fields' })
    }

    const userTok = jwt.verify(token, this.secret)
    const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
    const result = await validateAuthEmailUseCase.execute(userTok)
    if (!result.success) {
      LogService.execute({ from: 'authService', data: result.error.message, date: new Date(), status: 'error' }, this.logService)
      return res.status(500).json({ error: result.error.message })
    }

    const useCase = new RecoverPwdUserUseCase(this.userRepository)

    if (password !== confirmPassword) {
      await LogService.execute({ from: 'authService', data: 'Passwords do not match', date: new Date(), status: 'error' }, this.logService)
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { email } = userTok

    const user = await useCase.execute({ email, hashedPassword })

    if (!user.success) {
      await LogService.execute({ from: 'authService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
      if (user.error.message === 'User not found') {
        return res.status(400).json({ message: user.error.message })
      } else {
        return res.status(500).json({ message: 'Internal server error' })
      }
    }
    await LogService.execute({ from: 'authService', data: `${user.data.id} password recovered`, date: new Date(), status: 'info' }, this.logService)
    return res.status(201).json(user.data)
  }
}

module.exports = RecoverPwdUserController
