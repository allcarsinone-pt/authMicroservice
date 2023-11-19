const pg = require('pg')
const User = require('../entities/User')
class PostgreUserRepository {
  constructor (baseURI) {
    this.baseURI = baseURI
  }

  async create (user) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [user.name, user.email, user.password, user.role])
    await client.end()
    return new User(result.rows[0].name, result.rows[0].email, result.rows[0].password, result.rows[0].role, result.rows[0].id)
  }
  async wipe () {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    await client.query('DELETE FROM users')
    await client.end()
  }
  async findByEmail (email) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    await client.end()
    if (result.rows.length === 0) {
      return undefined
    }
    return new User(result.rows[0].name, result.rows[0].email, result.rows[0].password, result.rows[0].role, result.rows[0].id)
  }
}

module.exports = PostgreUserRepository
