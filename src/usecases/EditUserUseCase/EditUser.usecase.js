const User = require('../../entities/User')
const { Result, handleError } = require('../../util/Result')

class EditUserUseCase {
  /**
     * @description Constructor of EditUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} editUserDto, An object with name, email and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute (editUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findByUsername(editUserDto.username)
      if (!userFound) {
        return Result.failed(new Error('User not found'))
      }

      
      user = await this.userRepository.edit(editUserDto)
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = EditUserUseCase
