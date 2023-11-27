const pg = require('pg')
const User = require('../entities/User')
class PostgreUserRepository {
  constructor (baseURI) {
    this.baseURI = baseURI
  }

  async create (user) {
    const { username, name, email, password, address, city, postalcode, mobilephone } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const roleExists = await client.query('SELECT * FROM roles WHERE name = $1', [user.role])
    let roleId
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

  async edit (user) {
    const { id, username, name, address, city, postalcode, mobilephone, email } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const roleExists = await client.query('SELECT * FROM roles WHERE name = $1', [user.role])
    let roleId
    if (roleExists.rows.length === 0) {
      console.log('Role does not exist')
      const role = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [user.role])
      roleId = role.rows[0].id
    } else {
      console.log('Role exists')
      roleId = roleExists.rows[0].id
    }

    const query = 'UPDATE users SET  username = COALESCE($1, username), ' +
    'name = COALESCE($2, name), ' +
    'address = COALESCE($3, address), ' +
    'city = COALESCE($4, city), ' +
    'postalcode = COALESCE($5, postalcode), ' +
    'mobilephone = COALESCE($6, mobilephone), ' +
    'email = COALESCE($7, email), ' +
    'role_id = COALESCE($8, id) ' +
    'WHERE id = $9 ' +
    'RETURNING *'

    const values = [username, name, address, city, postalcode, mobilephone, email, roleId, id];
    const result = await client.query(query, values)

    const roleQuery = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    await client.end()
    const editedUser = { ...result.rows[0], role: roleQuery.rows[0].name }
    return new User(editedUser)
  }

  async delete (user) {
    const { id, roleId } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()
    
    const roleAdmin = 1
    const roleq = await client.query('SELECT role_id, count(role_id) AS cnt FROM users WHERE role_id = $1 GROUP BY role_id', ['1']) // Admin

    console.log( "ID: " + roleq.rows[0].role_id + " - CNT: " + roleq.rows[0].cnt );
    if ( roleq.rows[0].role_id === roleAdmin ) {
      if( roleq.rows[0].cnt <= 1 ) {
        console.log('Last admin user cannot be removed')
        return ({ Message: "Cannot remove last admin" });
      } else {
          console.log('allow delete admin user')
          roleId = roleq.rows[0].id
      }
    }

    try {
      await connection.connect();
      const query = 'DELETE FROM users WHERE userid = $1';
      const values = [id];
      await client.query(query, values);
      console.log( 'User successfully deleted' );
      return res.status(200).json({message: 'User successfully deleted.' });
    }
    catch(error) {
        console.log(error); //send to microservice logs
        return res.status(500).json({ message: 'Error deleting user.' })
    }
    finally {
        client.end();
    }
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
    return new User(result.rows[0].username, 
                    result.rows[0].name, 
                    result.rows[0].address, 
                    result.rows[0].city, 
                    result.rows[0].postalcode, 
                    result.rows[0].mobilephone, 
                    result.rows[0].email, 
                    result.rows[0].roleId, 
                    result.rows[0].id)
  }

  async findById (id) {
    const client = new pg.Client(this.baseURI)
    await client.connect()
    const result = await client.query('SELECT users.*, roles.name as "role" FROM users JOIN roles ON users.role_id = roles.id WHERE users.id = $1', [id])
    await client.end()
    if (result.rows.length === 0) {
      return undefined
    }
    return new User(result.rows[0].username, 
                    result.rows[0].name, 
                    result.rows[0].address, 
                    result.rows[0].city, 
                    result.rows[0].postalcode, 
                    result.rows[0].mobilephone, 
                    result.rows[0].email, 
                    result.rows[0].roleId, 
                    result.rows[0].id)
  }
}

module.exports = PostgreUserRepository
