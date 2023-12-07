const ChangePwdUserUseCase = require('../usecases/ChangePwdUseCase/ChangePwd.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const jwt = require('jsonwebtoken')

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class ChangePwdUserController {
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
      this.logService.execute('AuthServiceChangePwD', 'Missing fields.', 'error')
      return res.status(400).json({ message: 'Missing fields' })
    }

    const userTok = jwt.verify(token, this.secret)
    const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
    const result = await validateAuthUseCase.execute(userTok)
    if (!result.success) {
      this.logService.execute('AuthServiceChangePwD', result.error.message, 'error')
      return res.status(500).json({ error: result.error.message })
    }

    const useCase = new ChangePwdUserUseCase(this.userRepository)

    if (password !== confirmPassword) {
      this.logService.execute('AuthServiceChangePwD', 'Passwords do not match', 'error')
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { id } = userTok

    const user = await useCase.execute({ id, hashedPassword })

    if (!user.success) {
      this.logService.execute('AuthServiceChangePwD', `${user.error.message}`, 'error')
      if (user.error.message === 'User not found') {
        return res.status(400).json({ message: user.error.message })
      } else {
        return res.status(500).json({ message: 'Internal server error' })
      }
    }
    this.logService.execute('AuthServiceChangePwD', `${user.data.id} password changed`, 'info')

    return res.status(201).json(user.data)
  }
}

module.exports = ChangePwdUserController
