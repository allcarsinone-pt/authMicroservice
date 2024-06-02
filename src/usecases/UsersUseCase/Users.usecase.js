const { handleError, Result } = require('../../util/Result')

/**
 * @description Users use case of application
 */
class UsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository
  }

  /**
     * @description verifies if credentials are correct and returns all users
     * @param {*} loginDto email and password of user
     */
  async execute(loginDto, hashAlgorithm) {
    const withErrorHandling = handleError(async () => {
      const result = await this.userRepository.loadAllUsers(1)
      return Result.success(result || [])
    })
    return withErrorHandling()
  }
}

module.exports = UsersUseCase
