const jwt = require('jsonwebtoken')
const GetUserUseCase = require('../usecases/GetUserUseCase/GetUser.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

/**
 * @class EditUserController
 * @description Controller to edit an user
 */

class GetUserController {
  constructor(userRepository, secret, logService) {
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
  async execute(request, response) {
    const { username } = request.params

    // if (!request.headers.authorization) {
    //   return response.status(401).json({ error: 'No token provided' })
    // }
    // Verify token to get user profile
    try {
      /*const token = request.headers.authorization.split(' ')[1]
      const userAuth = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const resultEdit = await validateAuthUseCase.execute(userAuth)
      if (!resultEdit.success) {
        this.logService.execute('AuthServiceEdit', resultEdit.error.message, 'error')
        return response.status(500).json({ error: resultEdit.error.message })
      }*/




      const useCase = new GetUserUseCase(this.userRepository)

      const user = await useCase.execute({ username })

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

module.exports = GetUserController
