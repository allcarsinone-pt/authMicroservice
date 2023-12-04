const RegisterUserUseCase = require('../usecases/RegisterUserUseCase/RegisterUser.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class RegisterUserController
 * @description Controller to register a new user
 */

class RegisterUserController {
  constructor (userRepository, logService) {
    this.userRepository = userRepository
    this.logService = logService
  }

  /**
   * @description Method to execute http request for register user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    let { username, name, email, password, confirmPassword, address, city, postalcode, mobilephone, role_id } = request.body
    if (!email || !username || !name || !password || !confirmPassword || !role_id) {
      this.logService.execute("AuthServiceRegisterUser", 'Missing fields.', "error")
      return response.status(400).json({ message: 'Missing fields' });
    }

    if (password.length < 8) {
      this.logService.execute("AuthServiceRegisterUser", 'Password must be at least 8 characters', "error")
      return response.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (password !== confirmPassword) {
      this.logService.execute("AuthServiceRegisterUser", 'Passwords don\'t match', "error")
      return response.status(400).json({ message: 'Passwords don t match' })
    }

    const salt = bcrypt.genSaltSync(10)
    password = bcrypt.hashSync(password, salt)
    const usecase = new RegisterUserUseCase(this.userRepository)
    const user = await usecase.execute({ username, name, email, password, address, city, postalcode, mobilephone, role_id })

    if (!user.success) {
      this.logService.execute("AuthServiceRegisterUser", `${user.error.message}`, "error")
      
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid email') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    this.logService.execute("AuthServiceRegisterUser", `${user.data.email}-${user.data.role_id} registered`, "info")
    return response.status(201).json(user.data)
  }
}

module.exports = RegisterUserController
