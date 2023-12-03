const LoginUseCase = require('../usecases/LoginUseCase/Login.usecase')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const LogService = require('./services/LogService')
const { Client } = require('@elastic/elasticsearch');
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

class ResetDatabaseController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
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
    try {
    await this.userRepository.resetdatabase()
    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { message: 'Users database reset.', timestamp: new Date(), level: 'info',},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
    return res.status(200).json({message: 'Database reset' })
    } catch (error) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: error.message, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      
      return res.status(500).json({ error: error.message })
    }
  }
}

module.exports = ResetDatabaseController