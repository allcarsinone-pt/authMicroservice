const { handleError, Result } = require('../../util/Result')

/**
 * @description Login use case of application
 */
class ChangePwdEmailUseCase {
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
     * @description verifies if credentials are correct and returns an user object
     * @param {*} changePwdEmailDto email and password of user
     */
  async execute (changePwdEmailDto) {
    const withErrorHandling = handleError(async () => {
      const user = await this.userRepository.findByEmail(changePwdEmailDto.email)
      console.log(user)
      if (!user) {
        return Result.failed(new Error('Email not found in database'))
      }
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = ChangePwdEmailUseCase
