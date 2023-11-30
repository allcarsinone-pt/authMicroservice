const { Result, handleError } = require('../../util/Result')

class RecoverPwdUserUseCase {
  /**
     * @description Constructor of ChangePwdUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} recoverPwdUserDto, An object with id, id and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute (recoverPwdUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findByEmail(recoverPwdUserDto.email)
      if (!userFound) {
        return Result.failed(new Error('User not found'))
      }

      const user = await this.userRepository.changePwd(userFound.id, recoverPwdUserDto.hashedPassword)
      return Result.success(user)
    })
    return withErrorHandling()
  }
}

module.exports = RecoverPwdUserUseCase
