const pg = require('pg')
const User = require('../entities/User')

class PostgreUserRepository {
  constructor (baseURI, ROLE_ADMIN) {
    this.baseURI = baseURI
    this.ROLE_ADMIN = ROLE_ADMIN
  }

  async create (user) {
    const { username, name, email, password, address, city, postalcode, mobilephone, role_id } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = 'INSERT INTO users ( username, name, password, address, city, postalcode, ' +
    'mobilephone, email, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'
    const values = [username, name, password, address, city, postalcode, mobilephone, email, role_id]
    const result = await client.query(query, values);

    await client.end()
    return new User({ ...result.rows[0] })
  }

  async edit (user) {
    const { id, username, name, address, city, postalcode, mobilephone, email, role_id } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = 'UPDATE users SET  username = COALESCE($1, username), ' +
    'name = COALESCE($2, name), ' +
    'address = COALESCE($3, address), ' +
    'city = COALESCE($4, city), ' +
    'postalcode = COALESCE($5, postalcode), ' +
    'mobilephone = COALESCE($6, mobilephone), ' +
    'email = COALESCE($7, email), ' +
    'role_id = COALESCE($8, role_id) ' +
    'WHERE id = $9 ' +
    'RETURNING *'

    const values = [username, name, address, city, postalcode, mobilephone, email, role_id, id]
    const result = await client.query(query, values)

    await client.end()
    return new User({ ...result.rows[0] })
  }

  async delete (user) {
    const { id } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = 'DELETE FROM users WHERE id = $1'
    const values = [id]
    await client.query(query, values)
    console.log('User successfully deleted')

    await client.end()
    return { id }
  }

  async changePwd (id, newPassword) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    await client.query('UPDATE users SET password=$1 WHERE id = $2', [newPassword, id])
    await client.end()
    return { id }
  }

  async wipe () {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    await client.query('DELETE FROM users')
    await client.end()
  }

  async isLastAdmin () {
    const client = new pg.Client(this.baseURI)
    await client.connect()

    const result = await client.query('SELECT COUNT(users.id) as cnt FROM users INNER JOIN roles ON roles.id = users.role_id WHERE roles.name = $1', [this.ROLE_ADMIN])
    const res = result.rows[0].cnt
    await client.end()

    console.log('RES' + res <= 1)
    return res <= 1
  }

  async roleExists (roleId) {
    const client = new pg.Client(this.baseURI)
    console.log('ROLE', roleId)
    await client.connect()
    const result = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    await client.end()
    return result.rows.length > 0
  }

  async findByEmail (email) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT users.*, roles.name as "role" FROM users JOIN roles ON users.role_id = roles.id WHERE email = $1', [email])
    await client.end()
    console.log('RESULT' + result)
    if (!result || !result.rows || !result.rows.length) {
      return undefined
    }
    return new User({ ...result.rows[0] })
  }

  async findById (id) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT users.*, roles.name as "role" FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = $1', [id])
    await client.end()
    if (!result || !result.rows || !result.rows.length) {
      return undefined
    }
    return new User({...result.rows[0]});
  }
}

module.exports = PostgreUserRepository
