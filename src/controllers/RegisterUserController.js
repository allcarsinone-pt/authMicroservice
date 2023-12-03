const RegisterUserUseCase = require('../usecases/RegisterUserUseCase/RegisterUser.usecase')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const LogService = require('./services/LogService')
const { Client } = require('@elastic/elasticsearch');
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura

/**
 * @class RegisterUserController
 * @description Controller to register a new user
 */

class RegisterUserController {
  constructor (userRepository, logService) {
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

  /**
   * @description Method to execute http request for register user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    let { username, name, email, password, confirmPassword, address, city, postalcode, mobilephone, role_id } = request.body
    if (!email || !username || !name || !password || !confirmPassword || !role_id) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Missing fields.', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }

      return response.status(400).json({ message: 'Missing fields' });
    }

    if (password.length < 8) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Password must be at least 8 characters', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      
      return response.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (password !== confirmPassword) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Passwords don\'t match', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      
      return response.status(400).json({ message: 'Passwords don t match' })
    }

    const salt = bcrypt.genSaltSync(10)
    password = bcrypt.hashSync(password, salt)
    const usecase = new RegisterUserUseCase(this.userRepository)
    const user = await usecase.execute({ username, name, email, password, address, city, postalcode, mobilephone, role_id })

    if (!user.success) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: `${user.error.message}`, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid email') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { message: `${user.data.email}-${user.data.role_id} registered`, timestamp: new Date(), level: 'info',},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
    return response.status(201).json(user.data)
  }
}

module.exports = RegisterUserController
