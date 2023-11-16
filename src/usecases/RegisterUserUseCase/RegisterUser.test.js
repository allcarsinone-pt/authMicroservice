const RegisterUserUseCase = require('./RegisterUser.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')
const User = require('../../entities/User')

const makeSut = () => {
  const userRepository = new InMemoryUserRepository()
  const sut = new RegisterUserUseCase(userRepository)
  return { sut, userRepository }
}
describe('RegisterUserUseCase', () => {
  it('should register a new user', async () => {
    const { sut, userRepository } = makeSut()
    const result = await sut.execute({
      name: 'John Doe',
      email: 'test@test.com',
      password: '123456'
    })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('name', 'John Doe')
    expect(result.data).toHaveProperty('email', 'test@test.com')
    expect(result.data).not.toHaveProperty('password')
    const user = await userRepository.findByEmail('test@test.com')
    expect(user).toHaveProperty('id', result.data.id)
    expect(user).toHaveProperty('name', result.data.name)
    expect(user).toHaveProperty('email', result.data.email)
  })
  it('should return a result.failed if user already exists', async () => {
    const { sut, userRepository } = makeSut()
    userRepository.create(new User('John Doe', 'test@test.com', '123456', 'user-id'))
    const result = await sut.execute({
      name: 'John Doe',
      email: 'test@test.com',
      password: '123456'
    })
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Email already used')
  })
  it('should return a result.failed if user name validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      email: 'test@test.com',
      name: '',
      password: '123456'
    })
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Name is required')
  })
  it('should return a result.failed if user email validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      email: 'test',
      name: 'John Doe',
      password: '123456'
    })

    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Invalid email')
  })
})
