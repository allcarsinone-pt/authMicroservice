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
    this.logService = LogService
  }

  /**
   * @description Method to execute http request to edit an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    const { id, username, name, address, city, postalcode, mobilephone, email, role_id } = request.body
    if (!id || !email || !username || !name || !role_id) {
      this.logService.execute("AuthServiceEdit", 'Missing fields.', "error")
      return response.status(400).json({ message: 'Missing fields' })
    }

    const usecase = new EditUserUseCase(this.userRepository)
    const user = await usecase.execute({
      id, username, name, address, city, postalcode, mobilephone, email, role_id
    })

    if (!user.success) {
      this.logService.execute("AuthServiceEdit", `${user.error.message}`, "error")
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid user') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    this.logService.execute("AuthServiceEdit", `${user.data.id}-${user.data.role_id} edited`, "info")
    return response.status(201).json(user.data)
  }
}

module.exports = EditUserController
