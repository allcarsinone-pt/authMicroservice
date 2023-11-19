const pg = require('pg')
const User = require('../entities/User')
const { cp } = require('fs')
class PostgreUserRepository {
  constructor (baseURI) {
    this.baseURI = baseURI
  }

  async create (user) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    
    const roleExists = await client.query('SELECT * FROM roles WHERE name = $1', [user.role])
    let roleId = undefined
    if (roleExists.rows.length === 0) {
        console.log('role not exists')
        const role = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [user.role])
        roleId = role.rows[0].id
    } else {
        console.log('role exists')
        roleId = roleExists.rows[0].id
    }  

    const result = await client.query('INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *', [user.name, user.email, user.password, roleId])
   
    const role = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    console.log(role.rows[0])
    await client.end()
    return new User(result.rows[0].name, result.rows[0].email, result.rows[0].password, role.rows[0].name, result.rows[0].id)
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
    const result = await client.query('SELECT users.id, users.name, email, password, roles.name as "role" FROM users JOIN roles ON users.role_id = roles.id WHERE email = $1', [email])
    await client.end()
    if (result.rows.length === 0) {
      return undefined
    }
    return new User(result.rows[0].name, result.rows[0].email, result.rows[0].password, result.rows[0].role, result.rows[0].id)
  }
}

module.exports = PostgreUserRepository
