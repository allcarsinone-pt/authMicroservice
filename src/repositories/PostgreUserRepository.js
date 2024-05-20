const pg = require('pg')
const User = require('../entities/User')
const fs = require('fs/promises')
class PostgreUserRepository {
  constructor (baseURI) {
    this.baseURI = baseURI
  }

  async create (user) {
    const { username, name, email, password, address, city, postalcode, mobilephone, role_id } = user
    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = 'INSERT INTO users ( username, name, password, address, city, postalcode, ' +
    'mobilephone, email, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'

    const values = [username, name, password, address, city, postalcode, mobilephone, email, role_id]
    const result = await client.query(query, values)
    await client.end()
    return new User({ ...result.rows[0] })
  }

  async edit (user) {
    const { id, username, name, email, address, city, postalcode, mobilephone, role_id, photo } = user
    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = 'UPDATE users SET  username = COALESCE($1, username), ' +
    'name = COALESCE($2, name), ' +
    'address = COALESCE($3, address), ' +
    'city = COALESCE($4, city), ' +
    'postalcode = COALESCE($5, postalcode), ' +
    'mobilephone = COALESCE($6, mobilephone), ' +
    'email = COALESCE($7, email), ' +
    'role_id = COALESCE($8, role_id), ' +
    'photo = COALESCE($9, photo) ' +
    'WHERE id = $10 ' +
    'RETURNING *'

    const values = [username, name, address, city, postalcode, mobilephone, email, role_id, photo, id]
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

  async loadAllUsers (role_id=null) {
    const client = new pg.Client(this.baseURI)
    const query = role_id ? {query: 'SELECT * FROM users WHERE role_id = $1', values: [role_id]} : {query: 'SELECT * FROM users', values: []}
   
    await client.connect()
    const result = await client.query(query.query, query.values)
    await client.end()
    if (!result.rows.length) {
      return undefined
    }
    return result.rows
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

  async isLastAdmin (roleAdmin) {
    const client = new pg.Client(this.baseURI)
    await client.connect()

    const result = await client.query('SELECT COUNT(users.id) as cnt FROM users WHERE role_id = $1', [roleAdmin])
    const res = result.rows[0].cnt
    await client.end()

    console.log('RES' + res <= 1)
    return res <= 1
  }

  async roleExists (role) {
    const client = new pg.Client(this.baseURI)
    console.log('ROLE', role)
    await client.connect()
    const result = await client.query('SELECT * FROM roles WHERE id = $1', [role])
    await client.end()
    return result.rows.length > 0
  }

  async findByEmail (email) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email])
    await client.end()
    if (!result.rows.length) {
      return undefined
    }
    return new User({ ...result.rows[0] })
  }

  async findByUsername (username) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username])
    await client.end()
    if (!result.rows.length) {
      return undefined
    }
    return new User({ ...result.rows[0] })
  }

  async findById (id) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id])
    await client.end()
    if (!result.rows.length) {
      return undefined
    }
    return new User({ ...result.rows[0] })
  }

  mapRows(rows) {
    if (rows.length === 0) {
      return [];
    }
    return rows.map(row => row.route);
  }

  async getBlockedRoutes (id) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query(`SELECT * FROM user_blocked_routes 
                                       INNER JOIN routes ON user_blocked_routes.route_id = routes.id
                                       WHERE user_blocked_routes.user_id = $1`, [id])
    await client.end()

    if (result.rows.length === 0) {
      return undefined
    }

    const map = this.mapRows(result.rows)

    return map
    
  }

  async resetDatabase () {
    const client = new pg.Client(this.baseURI)
    await client.connect()

    const query = await fs.readFile('./database/reset-database.sql', 'utf8')
    await client.query(query)
    await client.end()
    return true
  }
}

module.exports = PostgreUserRepository
