const User = require('../../entities/User')
const { Result, handleError } = require('../../util/Result')

class DeleteUserUseCase {
  /**
     * @description Constructor of DeleteUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} deleteUserDto, An object with name, email and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute (deleteUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findById(deleteUserDto.id)
      if (!userFound) {
        return Result.failed(new Error('User not found'))
      }

      let user = User.delete(deleteUserDto)
      user = await this.userRepository.delete(user)
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = DeleteUserUseCase
