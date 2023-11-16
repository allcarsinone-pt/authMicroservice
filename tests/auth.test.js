const makeApp = require('../src/appBuilder')
const User = require('../src/entities/User')
const InMemoryUserRepository = require('../src/repositories/InMemoryUserRepository')
const userRepository = new InMemoryUserRepository()
const app = makeApp(userRepository)
const request = require('supertest')(app)
const bcrypt = require('bcrypt')
describe('POST /users/register', () => {
  it('should return 201 if user is registered', async () => {
    const requestBody = { email: 'test@test.com', name: 'test', password: '12345678', confirmPassword: '12345678', role: 'user' }
    const response = await request.post('/users/register').send(requestBody)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('name', requestBody.name)
    expect(response.body).toHaveProperty('email', requestBody.email)
    expect(response.body).toHaveProperty('role', requestBody.role)
    expect(response.body).not.toHaveProperty('password')
  })
  it('should return 400 if some parameter is missing', async () => {
    const requestBody = { name: 'test', password: '12345678', confirmPassword: '12345678', role: 'user' }
    const response = await request.post('/users/register').send(requestBody)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Missing fields')
  })
  it('should return 400 if password has less than 8 characters', async () => {
    const requestBody = { email: 'test@test.com', name: 'test', password: '123456', confirmPassword: '123456', role: 'user' }
    const response = await request.post('/users/register').send(requestBody)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Password must be at least 8 characters')
  })
  it('should return 400 if password and confirmPassword are different', async () => {
    const requestBody = { email: 'test@test.com', name: 'test', password: '12345678', confirmPassword: '1234567', role: 'user' }
    const response = await request.post('/users/register').send(requestBody)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Passwords don t match')
  })

  it('should return 400 if email is invalid', async () => {
    const requestBody = { email: 'test', name: 'test', password: '12345678', confirmPassword: '12345678', role: 'user' }
    const response = await request.post('/users/register').send(requestBody)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('message', 'Invalid email')
  })
})

describe('POST /users/login', () => {
  beforeEach(async () => {
    await userRepository.users.splice(0, userRepository.users.length)
  })
  afterEach(async () => {
    await userRepository.users.splice(0, userRepository.users.length)
  })
  it('should return 200 if user is logged in', async () => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync('12345678', salt)
    await userRepository.create(new User('John Doe', 'test@test.com', hash, 'user', 'user-id'))
    const requestBody = { email: 'test@test.com', password: '12345678' }
    const response = await request.post('/users/login').send(requestBody)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })
  it('should return 400 if email is wrong', async () => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync('12345678', salt)
    await userRepository.create(new User('John Doe', 'test1@test.com', hash, 'user', 'user-id'))
    const requestBody = { email: 'test@test.com', password: '12345678' }
    const response = await request.post('/users/login').send(requestBody)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'Email or password incorrect')
  })
  it('should return 400 if password is wrong', async () => {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync('123456789', salt)
    await userRepository.create(new User('John Doe', 'test@test.com', hash, 'user', 'user-id'))
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
    await userRepository.create(new User('John Doe', 'test@test.com', hash, 'user', 'user-id'))
  
    token = await request.post('/users/login').send({ email: 'test@test.com', password: '12345678' })
    console.log(token.body)
    token = token.body.token
    console.log(token)
    tokenCopy = token
  })
  beforeEach(async () => {
    token = tokenCopy
  })

  it('should return 200 if user is valid', async () => {
    console.log(token)
    const response = await request.get('/users/validate').set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id', 'user-id')
    expect(response.body).toHaveProperty('name', 'John Doe')
    expect(response.body).toHaveProperty('email', 'test@test.com')
    expect(response.body).toHaveProperty('role', 'user')
    expect(response.body).not.toHaveProperty('password')
  })
  it('should return 401 if no token is provided', async () => {
    const response = await request.get('/users/validate')
    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error', 'No token provided')

  })
})
