const express = require('express')
const router = require('./routes/UserRouter')
const RegisterUserController = require('./controllers/RegisterUserController')
const LoginController = require('./controllers/LoginController')
const ValidateAuthController = require('./controllers/ValidateAuthController')

function makeApp (userRepository) {
  const app = express()
  app.use(express.json())
  app.set('registerUserController', new RegisterUserController(userRepository))
  app.set('loginController', new LoginController(userRepository, process.env.SECRET_JWT || 'secret'))
  app.set('validateAuthController', new ValidateAuthController(userRepository, process.env.SECRET_JWT || 'secret'))
  app.use('/users', router)
  return app
}
module.exports = makeApp
