const EditUserUseCase = require('../usecases/EditUserUseCase/EditUser.usecase')
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class EditUserController
 * @description Controller to edit an user
 */

class EditUserController {
  constructor (userRepository, logService) {
    this.userRepository = userRepository
    this.logService = logService
  }

  /**
   * @description Method to execute http request to edit an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    const { id, username, name, address, city, postalCode, mobilePhone, email, role } = request.body
    if (!id || !email || !username || !name || !role) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
      return response.status(400).json({ message: 'Missing fields' })
    }

    const usecase = new EditUserUseCase(this.userRepository)
    const user = await usecase.execute({
      id, username, name, address, city, postalCode, mobilePhone, email, role
    })

    if (!user.success) {
      await LogService.execute({ from: 'authService', data: `${user.error.message}`, date: new Date(), status: 'error' }, this.logService)
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid user') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    await LogService.execute({ from: 'authService', data: `${user.data.id}-${user.data.role} edited`, date: new Date(), status: 'info' }, this.logService)
    return response.status(201).json(user.data)
  }
}

module.exports = EditUserController
