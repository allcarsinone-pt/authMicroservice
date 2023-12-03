const RecoverPwdUserUseCase = require('../usecases/RecoverPwdUseCase/RecoverPwd.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthEmailUseCase/ValidateAuthEmail.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')
const { Client } = require('@elastic/elasticsearch');

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class RecoverPwdUserController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
    this.elasticsearchClient = new Client({ 
      node: 'http://localhost:9200',
      log: 'trace',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
     * @description Method to execute http request to changePwd an user
     * @param {*} request request object from express
     * @param {*} response response object from express
     * @returns response object from express
     */

  async execute (req, res) {
    const { token, password, confirmPassword } = req.body

    if (!token || !password || !confirmPassword) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Missing fields', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return res.status(400).json({ message: 'Missing fields' })
    }

    const userTok = jwt.verify(token, this.secret)
    const validateAuthEmailUseCase = new ValidateAuthUseCase(this.userRepository)
    const result = await validateAuthEmailUseCase.execute(userTok)
    if (!result.success) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: result.error.message, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return res.status(500).json({ error: result.error.message })
    }

    const useCase = new RecoverPwdUserUseCase(this.userRepository)

    if (password !== confirmPassword) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Passwords do not match', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return res.status(400).json({ message: 'Passwords do not match' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { email } = userTok

    const user = await useCase.execute({ email, hashedPassword })

    if (!user.success) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: `${user.error.message}`, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      if (user.error.message === 'User not found') {
        return res.status(400).json({ message: user.error.message })
      } else {
        return res.status(500).json({ message: 'Internal server error' })
      }
    }

    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { message: `${user.data.id} password recovered`, timestamp: new Date(), level: 'info',},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
    return res.status(201).json(user.data)
  }
}

module.exports = RecoverPwdUserController
