const User = require('../entities/User')
const UserModel = require('../mongo-models/UserModel')
const RoleModel = require('../mongo-models/RolesModel')

class MongoUserRepository {
  constructor () {
  }

  async create (user) {
    console.log(user)
    try {
      const newUser = await UserModel.create(user)
      console.log(newUser)
      return new User({
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        address: newUser.address,
        city: newUser.city,
        postalcode: newUser.postalcode,
        mobilephone: newUser.mobilephone,
        blockedRoutes: newUser.blockedRoutes,
        role_id: user.role_id
      })
    } catch (error) {
      throw error
    }
  }

  async edit (user) {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(user.id, user, { new: true })
      return new User({ ...updatedUser, id: updatedUser._id })
    } catch (error) {
      throw error
    }
  }

  async delete (user) {
    try {
      await UserModel.findByIdAndDelete(user.id)
      console.log('User successfully deleted')
      return { id: user.id }
    } catch (error) {
      throw error
    }
  }

  async loadAllUsers () {
    try {
      const users = (await UserModel.find())
      return users
    } catch (error) {
      throw error
    }
  }

  async changePwd (id, newPassword) {
    try {
      await UserModel.findByIdAndUpdate(id, { password: newPassword })
      return { id }
    } catch (error) {
      throw error
    }
  }

  async wipe () {
    try {
      await UserModel.deleteMany({})
    } catch (error) {
      throw error
    }
  }

  async isLastAdmin (roleAdmin) {
    try {
      const count = await UserModel.countDocuments({ role_id: roleAdmin })
      return count <= 1
    } catch (error) {
      throw error
    }
  }

  async roleExists (role) {
    try {
      const existingRole = await RoleModel.findById(role)
      return !!existingRole
    } catch (error) {
      throw error
    }
  }

  async findByEmail (email) {
    try {
      const user = await UserModel.findOne({ email }).lean()
      console.log(user)
      if(!user) return undefined
      return new User({ ...user, id: user._id.toString() })
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async findById (id) {
    try {
      const user = await UserModel.findById(id).lean()
      return new User({ ...user, id: user._id.toString() })
    } catch (error) {
      throw error
    }
  }

  async resetDatabase () {
    try {
      // Implementation for resetting database using Mongoose
      // You can add your logic here to reset the database
      // For example, deleting all users and roles
      await UserModel.deleteMany({})
      await RoleModel.deleteMany({})
      return true
    } catch (error) {
      throw error
    }
  }
}

module.exports = MongoUserRepository
