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
    const port = startedContainer.getMappedPort(5432)
    const host = startedContainer.getHost()
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

    it('should return 200 if user is logged in', async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('12345678', salt)
      const user = { email: 'test@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: 2 }
      await userRepository.create(new User(user))
      const requestBody = { email: 'test@test.com', password: '12345678' }
      const response = await request.post('/users/login').send(requestBody)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('token') // No token if not logged in
    })
    it('should return 400 if email is wrong', async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('12345678', salt)
      const user = { email: 'test@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: 1 }
      await userRepository.create(new User(user))
      const requestBody = { email: 'test_WRONG@test.com', password: '12345678' }
      const response = await request.post('/users/login').send(requestBody)
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email or password incorrect')
    })
    it('should return 400 if password is wrong', async () => {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('9999_WRONG', salt)
      const user = { email: 'test@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: 1 }
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
      const user = { email: 'test1@test.com', name: 'John Doe', username: 'test_username', password: hash, role_id: 2 }
      await userRepository.create(new User(user))
      token = await request.post('/users/login').send({ email: 'test1@test.com', password: '12345678' })
      token = token.body.token
      tokenCopy = token
    })
    beforeEach(async () => {
      token = tokenCopy
    })

    afterAll(async () => {
    })

    it('should return 200 if user is valid', async () => {
      const response = await request.get('/users/validate').set('Authorization', `Bearer ${token}`)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('name', 'John Doe')
      expect(response.body).toHaveProperty('email', 'test1@test.com')
      expect(response.body).toHaveProperty('role_id', 2)
    })
    it('should return 401 if no token is provided', async () => {
      const response = await request.get('/users/validate')
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'No token provided')
    })
  })

  describe('GET /users/delete', () => {
    let token, tokenCopy, token2, token3, teste, teste2, teste3
    beforeAll(async () => {
      await userRepository.wipe()
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('12345678', salt)
      const user = { email: 'test2@test.com', name: 'John Client', username: 'test_username1', password: hash, role_id: 3, id: 1 }
      teste = await userRepository.create(new User(user))
      const user2 = { email: 'test3@test.com', name: 'Doe Manager', username: 'test_username2', password: hash, role_id: 2, id: 2 }
      teste2 = await userRepository.create(new User(user2))
      const user3 = { email: 'admin@test.com', name: 'Admin Doe', username: 'test_username3', password: hash, role_id: 1, id: 3 }
      teste3 = await userRepository.create(new User(user3))
      token = await request.post('/users/login').send({ email: 'test2@test.com', password: '12345678' })
      token = token.body.token
      token2 = await request.post('/users/login').send({ email: 'test3@test.com', password: '12345678' })
      token2 = token2.body.token
      token3 = await request.post('/users/login').send({ email: 'admin@test.com', password: '12345678' })
      token3 = token3.body.token
      tokenCopy = token
      console.log(tokenCopy, token2, token3)
    })
    beforeEach(async () => {
      token = tokenCopy
    })

    afterAll(async () => {
    })
    it('should return 400 when not admin and trying to remove another user', async () => {
      const response = await request.delete('/users/delete').set('Authorization', `Bearer ${token2}`).send({ id: teste3.id })
      expect(response.status).toBe(403)
      expect(response.body.message).toBe('Unauthorized delete')
    })
    it('should return 200 if user is removed', async () => {
      const response = await request.delete('/users/delete').set('Authorization', `Bearer ${token}`).send({ id: teste.id })
      expect(response.status).toBe(200)
    })
    it('should return 400 if user is removed - Cannot remove last user', async () => {
      const response = await request.delete('/users/delete').set('Authorization', `Bearer ${token3}`).send({ id: teste3.id })
      expect(response.status).toBe(400)
    })
    it('should return 200 if user is removed', async () => {
      const response = await request.delete('/users/delete').set('Authorization', `Bearer ${token3}`).send({ id: teste2.id })
      expect(response.status).toBe(200)
    })
  })
})
