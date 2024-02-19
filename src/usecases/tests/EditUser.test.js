const EditUseCase = require('../EditUserUseCase/EditUser.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')
const User = require('../../entities/User')

const testAlgorithm = (password, hash) => password === hash
describe('EditUseCase', () => {
  let userRepository, sut
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    sut = new EditUseCase(userRepository)
    userRepository.create(new User({ name: 'John Doe', username: 'johndoe', email: 'test@test.com', address: 'Down Street', 
    city: 'Barcelos', postalcode: '4000-123', mobilephone: '912345678', password: '12345678', role_id: 1 }))
  })
  it('should edit an user', async () => {
    const result = await sut.execute({
      id: 1,
      email: 'test@test.com',
      name: 'John Doe',
      username: 'johndoe',
      email: 'test@test.com',
      role_id: 1,
      address: 'Up Street',
      city: 'Braga'
    }, testAlgorithm)
    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('name', 'John Doe')
    expect(result.data).toHaveProperty('username', 'johndoe')
    expect(result.data).toHaveProperty('email', 'test@test.com')
    expect(result.data).toHaveProperty('role_id', 1)
    expect(result.data).toHaveProperty('address', 'Up Street')
    expect(result.data).toHaveProperty('city', 'Braga')
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
