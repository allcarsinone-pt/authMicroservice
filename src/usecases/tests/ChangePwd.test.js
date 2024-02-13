const ChangePwdUseCase = require('../ChangePwdUseCase/ChangePwd.usecase')
const InMemoryUserRepository = require('../../repositories/InMemoryUserRepository')
const User = require('../../entities/User')

const testAlgorithm = (password, hash) => password === hash
describe('ChangePwdUseCase', () => {
  let userRepository, sut
  beforeEach(async () => {
    userRepository = new InMemoryUserRepository()
    sut = new ChangePwdUseCase(userRepository)
    userRepository.create(new User({ name: 'John Doe', username: 'johndoe', email: 'test@test.com', address: 'Down Street', 
    city: 'Barcelos', postalcode: '4000-123', mobilephone: '912345678', password: '12345678', role_id: 1 }))
  })
  it('should change password', async () => {
    const result = await sut.execute({
      password: '12345678',
      newPassword: '87654321',
      confirmPassword: '87654321'
    }, testAlgorithm)
  })
})

