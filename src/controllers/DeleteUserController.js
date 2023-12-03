const jwt = require('jsonwebtoken')
const DeleteUserUseCase = require('../usecases/DeleteUserUseCase/DeleteUser.usecase')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')
const LogService = require('./services/LogService')
// Acoplado com o express. O req e o res têm de estar aqui ou não vale a pena complicar ?- perguntar ao professor de arquitetura
const { Client } = require('@elastic/elasticsearch');
const ROLE_ADMIN = 1

/**
 * @class DeleteUserController
 * @description Controller to delete an user
 */

class DeleteUserController {
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
   * @description Method to execute http request to delete an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (request, response) {
    if (!request.headers.authorization) {
      return response.status(401).json({ error: 'No token provided' })
    }
    // Verify token to get user profile
    try {
      const token = request.headers.authorization.split(' ')[1]
      const userAuth = jwt.verify(token, this.secret)
      const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
      const resultAUth = await validateAuthUseCase.execute(userAuth)
      if (!resultAUth.success) {
        try {
          const result = await this.elasticsearchClient.index({
            index: 'logs',
            body: { message: resultAUth.error.message, timestamp: new Date(), level: 'error',},
          });
        } catch (error) {
          console.error('Failed to index document:', error);
        }
        return response.status(500).json({ error: resultAUth.error.message })
      }

      const { id } = request.body
      if (!id) {
        try {
          const result = await this.elasticsearchClient.index({
            index: 'logs',
            body: { message: "Missing fields.", timestamp: new Date(), level: 'error',},
          });
        } catch (error) {
          console.error('Failed to index document:', error);
        }
        return response.status(400).json({ message: 'Missing fields' })
      }

      // Prevent delete last admin
      const isAdmin = (resultAUth.data.role_id === ROLE_ADMIN)
      if (isAdmin) {
        const userIsLastAdmin = await this.userRepository.isLastAdmin(ROLE_ADMIN)
        if (userIsLastAdmin) {
          try {
            const result = await this.elasticsearchClient.index({
              index: 'logs',
              body: { message: 'Last admin cannot be removed', timestamp: new Date(), level: 'info',},
            });
          } catch (error) {
            console.error('Failed to index document:', error);
          }
          return response.status(400).json({ message: 'Last admin cannot be removed' })
        }
      } else if (resultAUth.data.id !== id) { // If is not admin only can remove him self
        try {
          const result = await this.elasticsearchClient.index({
            index: 'logs',
            body: { message: 'Unauthorized delete', timestamp: new Date(), level: 'error',},
          });
        } catch (error) {
          console.error('Failed to index document:', error);
        }
        return response.status(403).json({ message: 'Unauthorized delete' })
      }

      const useCase = new DeleteUserUseCase(this.userRepository)
      const user = await useCase.execute({ id })

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
          return response.status(400).json({ message: user.error.message })
        } else {
          return response.status(500).json({ message: 'Internal server error' })
        }
      }
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: `${user.data.id} deleted`, timestamp: new Date(), level: 'info',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return response.status(200).json(user.data)
    } catch (error) {
      try {
        const result = await this.elasticsearchClient.index({
          index: 'logs',
          body: { message: error.message, timestamp: new Date(), level: 'error',},
        });
      } catch (error) {
        console.error('Failed to index document:', error);
      }
      return response.status(401).json({ error: error.message })
    }
  }
}

module.exports = DeleteUserController
