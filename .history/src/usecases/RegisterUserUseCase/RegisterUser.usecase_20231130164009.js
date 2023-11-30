const User = require('../../entities/User')
const { Result, handleError } = require('../../util/Result')

class RegisterUserUseCase {
  /**
     * @description Constructor of RegisterUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} registerUserDto, An object with name, email and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute (registerUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userAlreadyExists = await this.userRepository.findByEmail(registerUserDto.email)
      if (userAlreadyExists) {
        return Result.failed(new Error('Email already used'))
      }
      const roleExists = await this.userRepository.roleExists(registerUserDto.role_id)
      if (!roleExists) {
        return Result.failed(new Error('Role not found'))
      }

      let user = User.create(registerUserDto)
      user = await this.userRepository.create(user)
      console.log(user)
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = RegisterUserUseCase
