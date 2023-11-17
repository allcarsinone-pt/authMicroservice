const makeApp = require('./src/appBuilder')
//const dotenv = require('dotenv')
const swaggerDocument = require('./docs/swagger')
const swaggerUi = require('swagger-ui-express')
const InMemoryUserRepository = require('./src/repositories/InMemoryUserRepository')
const RabbitMQAdapter = require('./src/adapters/RabbitMQAdapter')

// dotenv.config()

const app = makeApp(new InMemoryUserRepository(), new RabbitMQAdapter(process.env.RABBIT_MQ_URI || 'amqp://localhost:5672'))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.SERVER_PORT || 3000}/`)
})
