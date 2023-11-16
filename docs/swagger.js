const swaggerJsDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'API for user authentication',
      contact: {
        name: 'All Cars in 1',
        email: 'allcarsinone2324@gmail.com'
      }

    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ]
  },
  apis: ['./src/routes/*.js']
}

const specs = swaggerJsDoc(options)

module.exports = specs
