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
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No token provided' })
    }
    // Verify token to get user profile
    try {
      const token = req.headers.authorization.split(' ')[1]
      const userAuth = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const resultEdit = await validateAuthUseCase.execute(userAuth)

      if (!resultEdit.success) {
        this.logService.execute('AuthServiceChangePwD', resultEdit.error.message, 'error')
        return res.status(500).json({ error: resultEdit.error.message })
      }

      const { oldPassword, password, confirmPassword } = req.body
      if (password !== confirmPassword) {
        this.logService.execute('AuthServiceChangePwD', 'Passwords do not match', 'error')
        return res.status(400).json({ message: 'Passwords do not match' })
      }

      // const hashedOldPassword = await bcrypt.hash(oldPassword, 10)
      if (await bcrypt.compare(oldPassword, resultEdit.data.password) === false) {
        this.logService.execute('AuthServiceChangePwD', 'Old password do not match', 'error')
        return res.status(400).json({ message: 'Old password do not match' })
      }

      const { id } = resultEdit.data
      const hashedPassword = await bcrypt.hash(password, 10)
      const useCase = new ChangePwdUserUseCase(this.userRepository)
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
      return res.status(201).json(user)
    } catch (error) {
      this.logService.execute('AuthServiceChangePwD', error.message, 'error')
      return res.status(401).json({ error: error.message })
    }
  }
}

module.exports = ChangePwdUserController
