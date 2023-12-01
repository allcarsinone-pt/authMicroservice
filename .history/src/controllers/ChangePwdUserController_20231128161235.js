
const ChangePwdUserUseCase = require('../usecases/ChangePwdUseCase/ChangePwd.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const LogService = require('./services/LogService')

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class ChangePwdUserController {
  constructor (userRepository, logService, token) {
    this.userRepository = userRepository
    this.logService = logService
  }

  /**
   * @description Method to execute http request to changePwd an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    const { id, password } = request.body
    if (!id) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
      return response.status(400).json({ message: 'Missing fields' })
    }

    //const useRepo = new ValidateAuthUseCase(this.userRepository)
    //const userLog = await useRepo.execute({ id })

    //if (userLog.error || userLog.id !== id) {
    //  return response.status(400).json({ message: 'Authentication error' })
   // }

    const useCase = new ChangePwdUserUseCase(this.userRepository)
    //const hashedPassword = await bcrypt.hash(password, 10)
    const user = await useCase.execute({ id, password })

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
