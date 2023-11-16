const RegisterUserUseCase = require('../usecases/RegisterUserUseCase/RegisterUser.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class RegisterUserController
 * @description Controller to register a new user
 */

class RegisterUserController {
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @description Method to execute http request for register user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */
  async execute (request, response) {
    let { email, name, password, confirmPassword, role } = request.body
    if (!email || !name || !password || !confirmPassword || !role) {
      await LogService.execute({ from: 'authService', data: 'Missing fields', date: new Date(), status: 'error' })
      return response.status(400).json({ message: 'Missing fields' })
    }
    if (password.length < 8) {
      await LogService.execute({ from: 'authService', data: 'Password must be at least 8 characters', date: new Date(), status: 'error' })
      return response.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (password !== confirmPassword) {
      await LogService.execute({ from: 'authService', data: 'Passwords don\'t match', date: new Date(), status: 'error' })
      return response.status(400).json({ message: 'Passwords don t match' })
    }

    const salt = bcrypt.genSaltSync(10)
    password = bcrypt.hashSync(password, salt)
    const usecase = new RegisterUserUseCase(this.userRepository)
    const user = await usecase.execute({
      name,
      email,
      password,
      role
    })

    if (!user.success) {
      await LogService.execute({ from: 'authService', data: `${user.error.message}`, date: new Date(), status: 'error' })
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid email') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    await LogService.execute({ from: 'authService', data: `${user.data.email}-${user.data.role} registered`, date: new Date(), status: 'info' })
    return response.status(201).json(user.data)
  }
}

module.exports = RegisterUserController
