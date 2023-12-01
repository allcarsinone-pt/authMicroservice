const { Result, handleError } = require('../../util/Result')

/**
 * @description Validate authentication use case
 * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
 */
class ValidateAuthEmailUseCase {
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @description verifies if credentials are correct and returns an user object
   * @param {*} userObject user object from token
   * @returns a user object
   */
  async execute (userObject) {
    const withErrorHandling = handleError(async () => {
      const user = await this.userRepository.findByEmail(userObject.email)
      if (!user || user.email !== userObject.email) {
        return Result.failed(new Error('Invalid authentication'))
      }
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = ValidateAuthEmailUseCase
