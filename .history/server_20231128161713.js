const makeApp = require('./src/appBuilder')
const dotenv = require('dotenv')
const swaggerDocument = require('./docs/swagger')
const swaggerUi = require('swagger-ui-express')
const RabbitMQAdapter\ = require('./src/adapters/RabbitMQAdapter')
const PostgreUserRepository = require('./src/repositories/PostgreUserRepository')

dotenv.config()

const app = makeApp(new PostgreUserRepository(process.env.DATABASE_URL, process.env.ROLE_ADMIN))

console.log(process.env.DATABASE_URL)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on http://localhost:${process.env.SERVER_PORT || 3000}/`)
})
