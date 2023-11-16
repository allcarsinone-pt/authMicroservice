const jwt = require('jsonwebtoken')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

/**
 * @description Controller to validate a user
 * @param {*} userRepository repository of user
 * @param {*} secret secret to generate token
 */
class ValidateAuthController {
  constructor (userRepository, secret) {
    this.userRepository = userRepository
    this.secret = secret
  }

  /**
   * @description verifies if token is valid and returns an user object
   * @param {*} req request object from express 
   * @param {*} res response object from express
   * @returns response object from express
   */
  async execute (req, res) {
    if (!req.headers.authorization) return res.status(401).json({ error: 'No token provided' })
    const token = req.headers.authorization.split(' ')[1]
    try {
      const user = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const result = await validateAuthUseCase.execute(user)
      if (!result.success) {
        return res.status(500).json({ error: result.error.message })
      }
      return res.status(200).json(result.data)
    } catch (error) {
      return res.status(401).json({ error: error.message })
    }
  }
}

module.exports = ValidateAuthController
