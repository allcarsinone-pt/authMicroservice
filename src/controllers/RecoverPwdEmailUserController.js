const RecoverPwdEmailUseCase = require('../usecases/RecoverPwdEmailUseCase/RecoverPwdEmail.usecase')
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')
const { Client } = require('@elastic/elasticsearch');

class RecoverPwdEmailController {
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

  async execute (req, res) {
    const loginDto = req.body
    const loginUseCase = new RecoverPwdEmailUseCase(this.userRepository)
    const result = await loginUseCase.execute(loginDto)
    if (!result.success) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: result.error.message, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      if (result.error.message === 'Email not found in database') {
        return res.status(400).json({ error: result.error.message })
      }
      return res.status(500).json({ error: result.error.message })
    }
    const token = jwt.sign(result.data, this.secret, { expiresIn: '2h' })
    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { message: `${result.data.email} logs in`, timestamp: new Date(), level: 'info',},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
    return res.status(200).json({ token })
  }
}

module.exports = RecoverPwdEmailController
