const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura

const { Result, handleError } = require('../../util/Result')

class ChangePwdUserUseCase {
  /**
     * @description Constructor of ChangePwdUserUseCase
     * @param {*} userRepository an UserRepository, it can be a in-memory or an mysql, postgres, etc
     */
  constructor (userRepository) {
    this.userRepository = userRepository
  }

  /**
   * @param {*} changePwdUserDto, An object with id, id and password
   * @returns an result object with a boolean success property, data property and error property
   */
  async execute (changePwdUserDto) {
    /**
     * function handleError is a util function to handle errors from async functions
     */
    const withErrorHandling = handleError(async () => {
      const userFound = await this.userRepository.findById(changePwdUserDto.id)
      if (!userFound) {
        return Result.failed(new Error('User not found'))
      }
      const { password } = userFound // Old password

      if(await bcrypt.compare(password, changePwdUserDto.hashedPassword) == false){
        return Result.failed(new Error('Old password is incorrect'))
      }

      const user = await this.userRepository.changePwd(changePwdUserDto.id, changePwdUserDto.hashedPassword)
      return Result.success(user)
    })
    return withErrorHandling()
  }
}

module.exports = ChangePwdUserUseCase
