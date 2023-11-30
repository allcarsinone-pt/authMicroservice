
const makeApp = require('../src/appBuilder')
const User = require('../src/entities/User')
const PostgreUserRepository = require('../src/repositories/PostgreUserRepository', 1)
const userRepository = new PostgreUserRepository('', 1)
const app = makeApp(userRepository)
const request = require('supertest')(app)
const bcrypt = require('bcrypt')

const { GenericContainer, PullPolicy } = require('testcontainers')

const container = new GenericContainer('postgres', 'latest')
let startedContainer

jest.setTimeout(999999)

describe('Tests', () => {
  beforeAll(async () => {
    startedContainer = await container.withEnvironment({ POSTGRES_USER: 'test', POSTGRES_PASSWORD: 'test', POSTGRES_DB: 'test_db' }).withCopyFilesToContainer([{source:'./database/init-database.sql', target:'/docker-entrypoint-initdb.d/init-database.sql'}]).withExposedPorts({host: 5433, container: 5432}).withPullPolicy(PullPolicy.defaultPolicy()).start()
    const port = await startedContainer.getMappedPort(5432)
    const host = await startedContainer.getHost()
    const uri = `postgres://test:test@${host}:${port}/test_db`

    userRepository.baseURI = uri

    console.log('connected to db')
  })
  afterAll(async () => {
    await startedContainer.stop()
  })

  describe('POST /users/register', () => {
    it('should return 201 if user is registered', async () => {
      const requestBody = { username: 'test_username', email: 'test@test.com', name: 'test', password: '12345678', confirmPassword: '12345678', role_id: 1 }
      const response = await request.post('/users/register').send(requestBody)
      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('name', requestBody.name)
      expect(response.body).toHaveProperty('email', requestBody.email)
      expect(response.body).toHaveProperty('role_id', requestBody.role_id)
      expect(response.body).not.toHaveProperty('password')
    })
    it('should return 400 if some parameter is missing', async () => {
      const requestBody = { name: 'test', username: 'test_username', password: '12345678', confirmPassword: '12345678', role_id: 1 }
      const response = await request.post('/users/register').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Missing fields')
    })
    it('should return 400 if password has less than 8 characters', async () => {
      const requestBody = { email: 'test@test.com', name: 'test', username: 'test_username', password: '123456', confirmPassword: '123456', role_id: 1 }
      const response = await request.post('/users/register').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Password must be at least 8 characters')
    })
    it('should return 400 if password and confirmPassword are different', async () => {
      const requestBody = { email: 'test@test.com', name: 'test', username: 'test_username', password: '12345678', confirmPassword: '1234567', role_id: 1 }
      const response = await request.post('/users/register').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Passwords don t match')
    })
    it('should return 400 if email is invalid', async () => {
      const requestBody = { email: 'test', name: 'test', username: 'test_username', password: '12345678', confirmPassword: '12345678', role_id: 1 }
      const response = await request.post('/users/register').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('message', 'Invalid email')
    })
  })

  describe('POST /users/login', () => {
    beforeEach(async () => {
      await userRepository.wipe()
    })
    afterEach(async () => {
      await userRepository.wipe()
    })

    it('should return 400 if user is logged in', async () => {
      const requestBody = { email: 'test@test.com', password: '12345678' }
      const response = await request.post('/users/login').send(requestBody)
      expect(response.status).toBe(400)
      // expect(response.body).toHaveProperty('token') // No token if not logged in
    })
    it('should return 400 if email is wrong', async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('12345678', salt)
      const user = { email: 'test1@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: '1' }
      await userRepository.create(new User(user))
      const requestBody = { email: 'test@test.com', password: '12345678' }
      const response = await request.post('/users/login').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email or password incorrect')
    })
    it('should return 400 if password is wrong', async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('9999', salt)
      const user = { email: 'test1@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: '1' }
      await userRepository.create(new User(user))
      const requestBody = { email: 'test@test.com', password: '12345678' }
      const response = await request.post('/users/login').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email or password incorrect')
    })
  })

  describe('GET /users/validate', () => {
    let token
    let tokenCopy = ''

    beforeAll(async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('12345678', salt)

      const user = { email: 'test1@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: '2' }
      await userRepository.create(new User(user))

      token = await request.post('/users/login').send({ email: 'test@test.com', password: '12345678' })
      console.log(token.body)
      token = token.body.token
      console.log(token)
      tokenCopy = token
    })
    beforeEach(async () => {
      token = tokenCopy
    })

    afterAll(async () => {
      token = tokenCopy
    })

    it('should return 200 if user is valid', async () => {
      console.log('TTTTTTOOOOOOOOOKKKKKEEEEEEEEENNNNNNNNNN ' + token)
      const response = await request.get('/users/validate').set('Authorization', 'Bearer ' + token)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('name', 'John Doe')
      expect(response.body).toHaveProperty('email', 'test@test.com')
      expect(response.body).toHaveProperty('role_id', '2')
      expect(response.body).not.toHaveProperty('password')
    })
    it('should return 401 if no token is provided', async () => {
      const response = await request.get('/users/validate')
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'No token provided')
    })
  })
})
