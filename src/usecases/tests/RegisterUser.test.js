const RegisterUserUseCase = require('../RegisterUserUseCase/RegisterUser.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')

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
      username: 'johndoe123',
      email: 'test@test.com',
      password: '12345678',
      role_id: 1
    })

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('name', 'John Doe')
    expect(result.data).toHaveProperty('username', 'johndoe123')
    expect(result.data).toHaveProperty('email', 'test@test.com')
    expect(result.data).toHaveProperty('role_id', 1)
    const user = await userRepository.findByEmail('test@test.com')
    expect(user).toHaveProperty('id', result.data.id)
    expect(user).toHaveProperty('name', result.data.name)
    expect(user).toHaveProperty('email', result.data.email)
  })
  it('should return a result.failed if user name validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      email: 'test@test.com',
      name: '',
      password: '123456',
      role_id: 1
    })
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Name is required')
  })
  it('should return a result.failed if password validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      email: 'test@test.com',
      username: 'testUsername',
      name: 'John Doe',
      password: '1234',
      role_id: 1
    })
    expect(result.error.message).toBe('Password must be at least 8 characters long') // -- ver mensagem que recebe-se no postman 
    // colocar apenas 4 caracteres por ex.
  })

  it('should return a result.failed if user email validation fails', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      email: 'test',
      name: 'John Doe',
      password: '123456',
      role_id: 1
    })

    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Invalid email')
  })
})
