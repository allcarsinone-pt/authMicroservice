/**
 * @description This is a in-memory repository, it can be a mysql, postgres, mongodb, etc
 * @see https://martinfowler.com/bliki/InMemoryTestDatabase.html
 */

class InMemoryUserRepository {
  constructor () {
    this.users = []
  }

  /**
   * @description Creates an user on the repository
   * @param {*} user User object
   * @returns the added object
   */
  async create (user) {
    this.users.push(user)
    return user
  }

  /**
  * @description Edites an user on the repository
  * @param {*} user User object
  * @returns the edited object
  */
  async edit (user) {
    this.users.push(user)
    return user
  }
    /**
  * @description Removes a user from the repository
  * @param {*} user User object
  * @returns the removed object
  */
    async delete (user) {
      this.users.push(user)
      return user
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
