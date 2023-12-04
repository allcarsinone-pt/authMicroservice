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
      const user = await this.userRepository.findByEmail(loginDto.email)
      console.log(user)
      if (!user) {
        return Result.failed(new Error('Email or password incorrect'))
      }

      const result = await this.userRepository.loadAllUsers()
      console.log(result)


      if (!hashAlgorithm(loginDto.password, user.password)) {
        return Result.failed(new Error('Email or password incorrect'))
      }
      return Result.success(user.toJson())
    })
    return withErrorHandling()
  }
}

module.exports = LoginUseCase
