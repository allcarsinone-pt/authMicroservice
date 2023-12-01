const DeleteUserUseCase = require('../usecases/DeleteUserUseCase/DeleteUser.usecase')
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class DeleteUserController
 * @description Controller to delete an user
 */

class DeleteUserController {
  constructor (userRepository, logService) {
    this.userRepository = userRepository
    this.logService = logService
  }

  /**
   * @description Method to execute http request to delete an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */
  
  async execute (request, response) {
    let { id } = request.body
    if (!id ) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
      return response.status(400).json({ message: 'Missing fields' })
    }

    const usecase = new DeleteUserUseCase(this.userRepository)
    const user = await usecase.execute({ id })

    if (!user.success) {
      await LogService.execute({ from: 'authService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
      if (user.error.message === 'User not found') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    await LogService.execute({ from: 'authService', data: `${user.data.id} deleted`, date: new Date(), status: 'info' }, this.logService)
    return response.status(201).json(user.data)
  }
}

module.exports = DeleteUserController
