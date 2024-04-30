const User = require('../../entities/User')
const { Result, handleError } = require('../../util/Result')

class ChangeProfilePhotoUseCase {
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
  async execute (id, photoUri) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findById(id)
      if (!userFound) {
        return Result.failed(new Error('User not found'))
      }

      
      const user = await this.userRepository.edit({id, photo: photoUri})
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = ChangeProfilePhotoUseCase
