const DeleteUseCase = require('../DeleteUserUseCase/DeleteUser.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')
const User = require('../../entities/User')

const testAlgorithm = (password, hash) => password === hash
describe('DeleteUseCase', () => {
  let userRepository, sut
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    sut = new DeleteUseCase(userRepository)
    userRepository.create(new User({ name: 'John Doe', username: 'johndoe', email: 'test@test.com', address: 'Down Street', 
    city: 'Barcelos', postalcode: '4000-123', mobilephone: '912345678', password: '12345678', role_id: 1 }))
  })
  it('should delete an user', async () => {
    const result = await sut.execute({
      id: 1,
      email: 'test@test.com',
      name: 'John Doe',
      username: 'johndoe'
    }, testAlgorithm)
    expect(result.success).toBe(true)
  })
  it('should return an error when user is not found', async () => {
    const result = await sut.execute({
      username: 'Mark Doe',
      email: 'mark@doe.com',
      password: '12345678'
    }, testAlgorithm)
    expect(result.success).toBe(false)
    expect(result.error.message).toEqual('User not found')
  })
})
