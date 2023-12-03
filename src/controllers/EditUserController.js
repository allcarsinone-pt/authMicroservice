const EditUserUseCase = require('../usecases/EditUserUseCase/EditUser.usecase')
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura
const { Client } = require('@elastic/elasticsearch');

/**
 * @class EditUserController
 * @description Controller to edit an user
 */

class EditUserController {
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
   * @description Method to execute http request to edit an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    const { id, username, name, address, city, postalcode, mobilephone, email, role_id } = request.body
    if (!id || !email || !username || !name || !role_id) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: 'Missing fields.', timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return response.status(400).json({ message: 'Missing fields' })
    }

    const usecase = new EditUserUseCase(this.userRepository)
    const user = await usecase.execute({
      id, username, name, address, city, postalcode, mobilephone, email, role_id
    })

    if (!user.success) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: `${user.error.message}`, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      if (user.error.message === 'Email already used' || user.error.message === 'Name is required' || user.error.message === 'Invalid user') {
        return response.status(400).json({ message: user.error.message })
      } else {
        return response.status(500).json({ message: 'Internal server error' })
      }
    }
    try {
      const result = await this.elasticsearchClient.index({
        index: 'logs',
        body: { message: `${user.data.id}-${user.data.role_id} edited`, timestamp: new Date(), level: 'info',},
      });
    } catch (error) {
      console.error('Failed to index document:', error);
    }
    return response.status(201).json(user.data)
  }
}

module.exports = EditUserController
