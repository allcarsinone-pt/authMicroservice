class User {
  /**
     * @description Constructor of user entity
     * @param {*} name name of user
     * @param {*} email email of user
     * @param {*} password password of user
     * @param {*} id id of user, can be a integer, an uuid or a string
     */
  constructor (user) {
    this.id = user.id
    this.username = user.username
    this.name = user.name
    this.email = user.email
    this.password = user.password
    this.address = user.address
    this.city = user.city
    this.postalcode = user.postalcode
    this.mobilephone = user.mobilephone
    this.photo = user.photo
    this.role_id = user.role_id
  }

  toJson () {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      email: this.email,
      password: this.password,
      address: this.address,
      city: this.city,
      postalcode: this.postalcode,
      mobilephone: this.mobilephone,
      photo: this.photo,
      role_id: this.role_id
    }
  }

  /**
   * @description Create a new instance of User making the necessary validations
   * @param {*} name Name of user
   * @param {*} email Email of User
   * @param {*} password Password of User
   * @param {*} id Id of User
   * @returns a new instance of User
   */
  static create (user) {
    if (!user) {
      throw new Error('Invalid user')
    }
    const { username, name, email, password, address, city, postalcode, mobilephone, role_id } = user

    if (name.length === 0) {
      throw new Error('Name is required')
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
      throw new Error('Invalid email')
    }
    if (username.length < 6) {
      throw new Error('Username is required')
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 8 characters long')
    }
    if (role_id === 0) {
      throw new Error('Role is required')
    }

    return new User(user)
  }

  /**
   * @description Edit User making the necessary validations
   * @param {*} name Name of user
   * @param {*} email Email of User
   * @param {*} username Username of User
   * @returns a new instance of User
   */
  static edit (user) {
    if (!user) {
      throw new Error('Invalid user')
    }
    const { username, name, email, password, address, city, postalcode, mobilephone, role_id } = user

    if (name.length === 0) {
      throw new Error('Name is required')
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) === false) {
      throw new Error('Invalid email')
    }
    if (username.length < 6) {
      throw new Error('Username is required and must contain at least 6 characters')
    }
    if (role_id === 0) {
      throw new Error('Role is required')
    }

    return new User(user)
  }

  /**
   * @description Change User password
   * @param {*} id User id
   * @param {*} hashedPassword Encripted password
   * @returns a new instance of User
   */
  static changePwd (id, hashedPassword) {
    if (!id || !hashedPassword) {
      throw new Error('Invalid user')
    }

    return new User({ id })
  }

  /**
   * @description Edit User making the necessary validations
   * @param {*} name Name of user
   * @param {*} email Email of User
   * @param {*} username Username of User
   * @returns a new instance of User
   */
  static delete (user) {
    if (!user) {
      throw new Error('Invalid user')
    }

    return new User(user)
  }
}

module.exports = User
