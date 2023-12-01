/**
 * @description This is a in-memory repository, it can be a mysql, postgres, mongodb, etc
 * @see https://martinfowler.com/bliki/InMemoryTestDatabase.html
 */

class InMemoryUserRepository {
    static CURRENT_ID = 1
  constructor () {
    this.users = []
  }

  /**
   * @description Creates an user on the repository
   * @param {*} user User object
   * @returns the added object
   */
  async create (user) {
    user.id = InMemoryUserRepository.CURRENT_ID++
    this.users.push(user)
    return user
  }

  /**
  * @description Edites an user on the repository
  * @param {*} user User object
  * @returns the added object
  */
  async edit (user) {
    const index = this.users.findIndex((u) => u.id === user.id)
    this.users[index] = user
    return user
  }

  async delete (user) {
    this.users = this.users.filter((u) => u.id === user.id)
    if (this.users.length === 0) {
      return false
    }
    return true
  }

  async changePwd(user) {
    const index = this.users.findIndex((u) => u.id === user.id)
    this.users[index].id = user.id
    this.users[index].password = user.password
  }
  
  /**
   * @description Find an user by email on the repository
   * @param {*} email user email
   * @returns user or undefined
   */
  async findByEmail (email) {
    return this.users.find((user) => user.email === email)
  }

  /**
   * @description Find an user by id on the repository
   * @param {*} id user id
   * @returns user or undefined
   */
    async findById (id) {
      return this.users.find((user) => user.id === id)
    }
}

module.exports = InMemoryUserRepository
