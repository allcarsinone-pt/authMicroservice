const pg = require('pg')
const User = require('../entities/User')
class PostgreUserRepository {
  constructor (baseURI) {
    this.baseURI = baseURI
  }

  async create (user) {
    let { username, name, email, password, address, city, postalcode, mobilephone, role } = user

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

    const query = 'INSERT INTO users ( username, name, password, address, city, postalcode, ' +
    'mobilephone, email, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [username, name, password, address, city, postalcode, mobilephone, email, roleId];
    const result = await client.query(query, values);

    const roleQuery = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    console.log(roleQuery.rows[0])
    await client.end()
    const createdUser = { ...result.rows[0], role: roleQuery.rows[0].name }
    return new User(createdUser)
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
    const result = await client.query('SELECT users.*, roles.name as "role" FROM users JOIN roles ON users.role_id = roles.id WHERE email = $1', [email])
    await client.end()
    if (result.rows.length === 0) {
      return undefined
    }
    return new User(result.rows[0])
  }
}

module.exports = PostgreUserRepository
