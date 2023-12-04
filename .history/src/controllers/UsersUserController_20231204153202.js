const jwt = require('jsonwebtoken')
const UsersUseCase = require('../usecases/UsersUseCase/Users.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
const LogService = require('./services/LogService')

/**
 * @class UsersUserController
 * @description Controller to edit an user
 */

class UsersUserController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
  }

  /**
   * @description Method to execute http request to edit an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    if (!request.headers.authorization) {
      return response.status(401).json({ error: 'No token provided' })
    }
    // Verify token to get user profile
    try {
      const token = request.headers.authorization.split(' ')[1]
      const userAuth = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const resultEdit = await validateAuthUseCase.execute(userAuth)
      if (!resultEdit.success) {
        LogService.execute({ from: 'authEditService', data: resultEdit.error.message, date: new Date(), status: 'error' }, this.logService)
        return response.status(500).json({ error: resultEdit.error.message })
      }

      // AQUI CONTROLAR AS PERMISSÕES DE VISUALIZAÇÃO

      const useCase = new UsersUseCase(this.userRepository)
      const user = await useCase.execute({})

      if (!user.success) {
        await LogService.execute({ from: 'authUsersService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
        if (user.error.message === 'No users found') {
          return response.status(400).json({ message: user.error.message })
        } else {
          return response.status(500).json({ message: 'Internal server error' })
        }
      }
      await LogService.execute({ from: 'authUsersService', data: `${user.data.id}-${user.data.role_id} found`, date: new Date(), status: 'info' }, this.logService)
      return response.status(201).json(user.data)
    } catch (error) {
      await LogService.execute({ from: 'authUsersService', data: error.message, date: new Date(), status: 'error' }, this.logService)
      return response.status(401).json({ error: error.message })
    }
  }
}

module.exports = UsersUserController
