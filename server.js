const makeApp = require('./src/appBuilder')
const dotenv = require('dotenv')
const swaggerDocument = require('./docs/swagger')
const swaggerUi = require('swagger-ui-express')
const PostgreUserRepository = require('./src/repositories/PostgreUserRepository')
const RabbitMQLogAdapter = require('./src/adapters/RabbitMQLogAdapter')
const path = require('path');
const bodyParser = require('body-parser')
const express = require('express')
const ElasticLogService = require('./src/controllers/services/ElasticLogService')
const LogMockAdapter = require('./src/adapters/LogMockAdapter')
dotenv.config()

// new LogMockAdapter())
const app = makeApp(new PostgreUserRepository(process.env.DATABASE_URL), new LogMockAdapter())
//new RabbitMQLogAdapter(process.env.RABBITMQ_URL))

console.log(process.env.DATABASE_URL)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Midleware
app.use('/', express.static(path.join(__dirname, 'src/static')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.listen(process.env.SERVER_PORT || 3001, () => {
  console.log(`Server is running on http://localhost:${process.env.SERVER_PORT || 3001}/`)
})
