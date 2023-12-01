const makeApp = require('./src/appBuilder')
const dotenv = require('dotenv')
const swaggerDocument = require('./docs/swagger')
const swaggerUi = require('swagger-ui-express')
const RabbitMQAdapter = require('./src/adapters/RabbitMQAdapter')
const PostgreUserRepository = require('./src/repositories/PostgreUserRepository')

const path = require('path');
const bodyParser = require('body-parser');
const express = require('express')

dotenv.config()

const app = makeApp(new PostgreUserRepository(process.env.DATABASE_URL))

console.log(process.env.DATABASE_URL)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Midleware
const appExp = express()
appExp.use('/', express.static(path.join(__dirname, 'static')))
appExp.use(bodyParser.json())
appExp.use(bodyParser.urlencoded({ extended: false })) //parse application/x-www-form-urlencoded

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.SERVER_PORT || 3000}/`)
})
