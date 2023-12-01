const ChangePwdUserUseCase = require('../usecases/ChangePwdUserUseCase/ChangePwdUserUseCase')
const LogService = require('./services/LogService')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.TOKEN_SECRET

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class ChangePwdUserController {
  constructor (userRepository, logService, token) {
    this.userRepository = userRepository
    this.logService = logService
    this.token = token
  }

  /**
   * @description Method to execute http request to changePwd an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    const { id } = request.body
    if (!id) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
      return response.status(400).json({ message: 'Missing fields' })
    }


//    const user =jwt.verify(token, JWT_SECRET);
//    const _id=user.id;



    const useCase = new ChangePwdUserUseCase(this.userRepository)
    const user = await useCase.execute({ id })

    if (!user.success) {
      await LogService.execute({ from: 'authService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
      if (user.error.message === 'User not found') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    await LogService.execute({ from: 'authService', data: `${user.data.id} password changed`, date: new Date(), status: 'info' }, this.logService)
    return response.status(201).json(user.data)
  }
}

module.exports = ChangePwdUserController
