'use strict'
// database schema
const mongoose = require('mongoose')
const schema = mongoose.Schema
const userSchema = new schema(
  {
    username: {
      type: String,
      required: true,
      unique: true // username must be unique
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String
      
    },
    city: {
      type: String
     
    },
    postalcode: {
      type: String
     
    },
    mobilephone: {
      type: String
      
    },
    role_id: {
      type: Number,
      required: true
    },
    blockedRoutes: [
      {
        type: String
      }
    ]
  },
  { collection: 'users' }
)
const User = mongoose.model('User', userSchema)

module.exports = User
