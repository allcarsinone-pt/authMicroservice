'use strict'
// database schema
const mongoose = require('mongoose')
const schema = mongoose.Schema
const roleSchema = new schema({
  _id: Number,
  name: {
    type: String,
    required: true,
    unique: true // role must be unique
  }
}, { collection: 'roles' }
)
const Role = mongoose.model('Role', roleSchema)

module.exports = Role
