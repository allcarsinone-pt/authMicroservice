const pg = require('pg')
const User = require('../entities/User')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.TOKEN_SECRET

class PostgreUserRepository {
  constructor (baseURI, ROLE_ADMIN) {
    this.baseURI = baseURI
    this.ROLE_ADMIN = ROLE_ADMIN
  }

  async create (user) {
    const { username, name, email, password, address, city, postalcode, mobilephone, role } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const roleExists = await client.query('SELECT * FROM roles WHERE name = $1', [role])
    let roleId
    if (roleExists.rows.length === 0) {
      console.log('role not exists')
      const roleQuery = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [role])
      roleId = roleQuery.rows[0].id
    } else {
      console.log('role exists')
      roleId = roleExists.rows[0].id
    }

    const query = 'INSERT INTO users ( username, name, password, address, city, postalcode, ' +
    'mobilephone, email, role_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *'
    const values = [username, name, password, address, city, postalcode, mobilephone, email, roleId]
    const result = await client.query(query, values);

    const roleQuery = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    console.log(roleQuery.rows[0])
    await client.end()
    const createdUser = { ...result.rows[0], role: roleQuery.rows[0].name }
    return new User(createdUser)
  }

  async edit (user) {
    const { id, username, name, address, city, postalcode, mobilephone, email, role } = user

    const client = new pg.Client(this.baseURI)
    await client.connect()

    const roleExists = await client.query('SELECT * FROM roles WHERE name = $1', [role])
    let roleId
    if (roleExists.rows.length === 0) {
      console.log('Role does not exist')
      const roleQuery = await client.query('INSERT INTO roles (name) VALUES ($1) RETURNING *', [role])
      roleId = roleQuery.rows[0].id
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

    const values = [username, name, address, city, postalcode, mobilephone, email, roleId, id]
    const result = await client.query(query, values)

    const roleQuery = await client.query('SELECT * FROM roles WHERE id = $1', [roleId])
    await client.end()
    const editedUser = { ...result.rows[0], role: roleQuery.rows[0].name }
    return new User(editedUser)
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







  async changePwd (UserID, Password, NewPassword) {

    const {token,oldPassword,newPassword} = user;
    console.log(token,oldPassword,newPassword);
    if(!oldPassword || !newPassword){
        return({status:400, message:'all fields are required'});
    }
    if(newPassword.length < 6){
        return({status:400, message:'password must be at least 6 characters'});
    }
    try{
        const user=jwt.verify(token, JWT_SECRET);
        const _id=user.id;
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id }, { password: hashedPassword });
        return({status:200, message:'password changed'});
        console.log(v);
    }catch(err){
        console.log(err);
        return({status:400, message:'error changing password'});

    }
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
