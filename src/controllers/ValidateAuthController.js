const jwt = require('jsonwebtoken')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
const LogService = require('./services/LogService')
const { Client } = require('@elastic/elasticsearch');

/**
 * @description Controller to validate a user
 * @param {*} userRepository repository of user
 * @param {*} secret secret to generate token
 */
class ValidateAuthController {
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
   * @description verifies if token is valid and returns an user object
   * @param {*} req request object from express
   * @param {*} res response object from express
   * @returns response object from express
   */
  async execute (req, res) {
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'No token provided' })
    }
    const token = req.headers.authorization.split(' ')[1]
    try {
      const user = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const result = await validateAuthUseCase.execute(user)
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
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: `${result.data.id}-${result.data.role_id} validated`, timestamp: new Date(), level: 'info',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return res.status(200).json(result.data)
    } catch (error) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: error.message, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return res.status(401).json({ error: error.message })
    }
  }
}

module.exports = ValidateAuthController
