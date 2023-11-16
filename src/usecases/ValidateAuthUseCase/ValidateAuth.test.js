const ValidateAuthUseCase = require('./ValidateAuth.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')
const User = require('../../entities/User')

const makeSut = () => {
  const userRepository = new InMemoryUserRepository()
  const sut = new ValidateAuthUseCase(userRepository)
  return { sut, userRepository }
}
describe('ValidateAuthUseCase', () => {
  it('should validate a user', async () => {
    const { sut, userRepository } = makeSut()
    const user = await userRepository.create(new User('John Doe', 'test@test.com', '12345678', 'user', 'user-id'))
    const result = await sut.execute(user.toJson())
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id', user.id)
    expect(result.data).toHaveProperty('name', user.name)
    expect(result.data).toHaveProperty('email', user.email)
    expect(result.data).not.toHaveProperty('password')
  })
  it('should return a result.failed if user is not found', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({ id: 'user-id', email: 'test@test.com', name: 'John Doe' })
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Invalid authentication')
  })
  it('should return a result.failed if user id is not found', async () => {
    const { sut, userRepository } = makeSut()
    const user = await userRepository.create(new User('John Doe', 'test@test.com','12345678', 'user', 'user-id'))
    const result = await sut.execute({ id: 'user-id-2', email: user.email, name: user.name })
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Invalid authentication')
  })
})
