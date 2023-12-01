const jwt = require('jsonwebtoken')
const DeleteUserUseCase = require('../usecases/DeleteUserUseCase/DeleteUser.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class DeleteUserController
 * @description Controller to delete an user
 */

class DeleteUserController {
  constructor (userRepository, secret, roleAdmin, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.roleAdmin = roleAdmin
    this.logService = logService
  }

  /**
   * @description Method to execute http request to delete an user
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
      const resultAUth = await validateAuthUseCase.execute(userAuth)
      if (!resultAUth.success) {
        LogService.execute({ from: 'authDeleteService', data: resultAUth.error.message, date: new Date(), status: 'error' }, this.logService)
        return response.status(500).json({ error: resultAUth.error.message })
      }

      const isAdmin = (resultAUth.data.role_id === parseInt(this.roleAdmin))
      const { id } = request.body

      // If is not admin only can remove him self
      if (!isAdmin && resultAUth.data.id !== id) {
        await LogService.execute({ from: 'authDeleteService', data: 'Unauthorized delete', date: new Date(), status: 'error' }, this.logService)
        return response.status(400).json({ message: 'Unauthorized delete' })
      }

      if (!id) {
        await LogService.execute({ from: 'authDeleteService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
        return response.status(400).json({ message: 'Missing fields' })
      }

      const useCase = new DeleteUserUseCase(this.userRepository)
      const user = await useCase.execute({ id })

      if (!user.success) {
        await LogService.execute({ from: 'authDeleteService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
        if (user.error.message === 'User not found') {
          return response.status(400).json({ message: user.error.message })
        } else if (user.error.message === 'User cannot be removed as a last admin') {
          return response.status(400).json({ message: user.error.message })
        } else {
          return response.status(500).json({ message: 'Internal server error' })
        }
      }
      await LogService.execute({ from: 'authDeleteService', data: `${user.data.id} deleted`, date: new Date(), status: 'info' }, this.logService)
      return response.status(201).json(user.data)
    } catch (error) {
      await LogService.execute({ from: 'authDeleteService', data: error.message, date: new Date(), status: 'error' }, this.logService)
      return response.status(401).json({ error: error.message })
    }
  }
}

module.exports = DeleteUserController
