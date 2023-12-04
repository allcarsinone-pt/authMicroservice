const { handleError, Result } = require('../../util/Result')

/**
 * @description Login use case of application
 */
class LoginUseCase {
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
     * @description verifies if credentials are correct and returns an user object
     * @param {*} loginDto email and password of user
     */
  async execute (loginDto, hashAlgorithm) {
    const withErrorHandling = handleError(async () => {
      const result = await this.userRepository.loadAllUsers()
      console.log(result)
      return Result.success(result.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = LoginUseCase
