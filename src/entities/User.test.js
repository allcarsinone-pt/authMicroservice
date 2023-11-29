const User = require('./User')

describe('User entity', () => {
  it('should create a new user', () => {
    const user = User.create({username: 'johndoe123',name:'John Doe', email:'test@test.com', password: '12345678', role:'test-role', id:'user-id'})
    
    expect(user).toHaveProperty('id', 'user-id')
    expect(user).toHaveProperty('name', 'John Doe')
    expect(user).toHaveProperty('username', 'johndoe123')
    expect(user).toHaveProperty('email', 'test@test.com')
    expect(user).toHaveProperty('password', '12345678')
    expect(user).toHaveProperty('role', 'test-role')
  })
  it('should throw an error when name is empty', () => {
    expect(() => User.create('', 'test@test.com', '123456', 'user-id')).toThrow(Error)
  })
  it('should throw an error when email is invalid', () => {
    expect(() => User.create('John Doe', 'test', '123456', 'user-id')).toThrow(Error)
  })
})
