const User = require('../../entities/User')
const { Result, handleError } = require('../../util/Result')

class DeleteUserUseCase {
  /**
     * @description Constructor of DeleteUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} deleteUserDto, An object with name, email and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute(deleteUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findByUsername(deleteUserDto.username)
      if (!userFound) {
        return Result.success('0 users deleted.')
      }

      let user = User.delete(deleteUserDto)
      user = await this.userRepository.delete(user)
      return Result.success()
    })
    return withErrorHandling()
  }
}

module.exports = DeleteUserUseCase
