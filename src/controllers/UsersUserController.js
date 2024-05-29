const jwt = require('jsonwebtoken')
const UsersUseCase = require('../usecases/UsersUseCase/Users.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

const ROLE_ADMIN = 1

/**
 * @class UsersUserController
 * @description Controller to edit an user
 */

class UsersUserController {
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

    // if (!request.headers.authorization) {
    //   return response.status(401).json({ error: 'No token provided' })
    // }

    // Verify token to get user profile
    try {
      // const { roleid }  = request.query
      // const token = request.headers.authorization.split(' ')[1]
      // const userAuth = jwt.verify(token, this.secret)
      // const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      // const resultEdit = await validateAuthUseCase.execute(userAuth)

      //if (!resultEdit.success) {
      //this.logService.execute('AuthServiceGetUsers', resultEdit.error.message, 'error')
      //  return response.status(500).json({ error: resultEdit.error.message })
      //}

      // Prevent not allowed role_id to vi1ew users
      // const isAdmin = (resultEdit.data.role_id === ROLE_ADMIN)
      //if (!isAdmin) {
      //this.logService.execute('AuthServiceGetUsers', 'Unauthorized User', 'error')
      //return response.status(403).json({ message: 'Unauthorized User' })
      //}

      const useCase = new UsersUseCase(this.userRepository)
      const user = await useCase.execute()

      if (!user.success) {
        this.logService.execute('AuthServiceGetUsers', user.error.message, 'error')
        if (user.error.message === 'No users found') {
          return response.status(400).json({ message: user.error.message })
        } else {
          return response.status(500).json({ message: 'Internal server error' })
        }
      }
      this.logService.execute('AuthServiceGetUsers', `${user.data.length} users found`, 'info')
      return response.status(201).json(user.data)
    } catch (error) {
      this.logService.execute('AuthServiceGetUsers', error.message, 'error')
      return response.status(401).json({ error: error.message })
    }
  }
}

module.exports = UsersUserController
