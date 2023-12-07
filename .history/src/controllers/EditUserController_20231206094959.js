const jwt = require('jsonwebtoken')
const EditUserUseCase = require('../usecases/EditUserUseCase/EditUser.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

/**
 * @class EditUserController
 * @description Controller to edit an user
 */

class EditUserController {
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
    const { username, name, email, address, city, postalcode, mobilephone, role_id } = request.body
    if (!email || !username || !name || !role_id) {
      this.logService.execute('AuthServiceEdit', 'Missing fields.', 'error')
      return response.status(400).json({ message: 'Missing fields' })
    }

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
        this.LogService.execute({ from: 'AuthServiceEdit', data: resultEdit.error.message, date: new Date(), status: 'error' }, this.logService)
        return response.status(500).json({ error: resultEdit.error.message })
      }

      const { id } = resultEdit.data

      if (!id || !email || !username || !name || !role_id) {
        await this.LogService.execute({ from: 'AuthServiceEdit', data: 'Missing fields', date: new Date(), status: 'error' }, this.logService)
        return response.status(400).json({ message: 'Missing fields' })
      }

      const useCase = new EditUserUseCase(this.userRepository)
      const user = await useCase.execute({ id, username, name, address, city, postalcode, mobilephone, email, role_id })

      if (!user.success) {
        this.logService.execute('AuthServiceEdit', `${user.error.message}`, 'error')
        if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid user') {
          return response.status(400).json({ message: user.error.message })
        } else {
          return response.status(500).json({ message: 'Internal server error' })
        }
      }
      this.logService.execute('AuthServiceEdit', `${user.data.id}-${user.data.role_id} edited`, 'info')
      return response.status(201).json(user.data)
    } catch (error) {
      this.logService.execute('AuthServiceEdit', error.message, 'error')
      return response.status(401).json({ error: error.message })
    }
  }
}

module.exports = EditUserController
