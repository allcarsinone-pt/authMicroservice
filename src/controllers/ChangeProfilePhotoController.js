const ChangeProfilePhotoUseCase = require('../usecases/ChangeProfilePhotoUseCase/ChangeProfilePhoto.usecase')
const ChangePwdUserUseCase = require('../usecases/ChangePwdUseCase/ChangePwd.usecase')
const ValidateAuth = require('../usecases/ValidateAuthEmailUseCase/ValidateAuthEmail.usecase')
const fs = require('fs')
const bcrypt = require('bcrypt') // ? - tem de estar aqui ? TIP: perguntar ao professor de arquitetura
const jwt = require('jsonwebtoken')
const ValidateAuthUseCase = require('../usecases/ValidateAuthUseCase/ValidateAuth.usecase')

/**
 * @class ChangePwdUserController
 * @description Controller to changePwd an user
 */

class ChangeProfilePhotoController {
  constructor (userRepository, secret, logService) {
    this.userRepository = userRepository
    this.secret = secret
    this.logService = logService
  }

  /**
   * @description Method to execute http request to changePwd an user
   * @param {*} request request object from express
   * @param {*} response response object from express
   * @returns response object from express
   */

  async execute (req, res) {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({ error: 'No token provided' })
      }
      // Verify token to get user profile
      
        const token = req.headers.authorization.split(' ')[1]
        const userAuth = jwt.verify(token, this.secret)
        const validateAuthUseCase = new ValidateAuthUseCase(this.userRepository)
        const resultEdit = await validateAuthUseCase.execute(userAuth)
        const multerMiddleware = req.app.get("multer-config")
        if(multerMiddleware === undefined){
          return res.status(500).json({ error: 'Internal server error' })
        }
        if (!resultEdit.success) {
          this.logService.execute('AuthServiceChangeProfile', resultEdit.error.message, 'error')
          return res.status(500).json({ error: resultEdit.error.message })
        }
  
        multerMiddleware(req, res, (err) => {
          if (err) {
            this.logService.execute('AuthServiceChangeProfile', err, 'error')
            return res.status(500).json({ error: err })
          }
  
          if (!req.file) {
            this.logService.execute('AuthServiceChangeProfile', 'No file uploaded', 'error')
            return res.status(400).json({ error: 'No file uploaded' })
          }
          
  
  
          const { id, username } = resultEdit.data
  
          const filename = `${username}.${req.file.mimetype.split('/')[1]}`
  
          fs.rename(req.file.path, `./src/static/profile/${filename}`, async (err) => {
              if(err)
              {
                  return res.status(500).json({ error: err })
              }
  
              try {
  
                  const photoUseCase = new ChangeProfilePhotoUseCase(this.userRepository)
  
                  const user = await photoUseCase.execute(id, `/profile/${filename}`)
  
  
  
                  if (!user.success) {
                    this.logService.execute('AuthServiceChangePwDEmail', `${user.error.message}`, 'error')
                    if (user.error.message === 'User not found') {
                      return res.status(400).json({ message: user.error.message })
                    } else {
                      return res.status(500).json({ message: 'Internal server error' })
                    }
                    
                  }
                    this.logService.execute('AuthServiceChangePwDEmail', `${user.data.id} password changed`, 'info')
                    return res.status(200).json(user.data)
                } catch (error) {
                    this.logService.execute('AuthServiceChangePwDEmail', error.message, 'error')
                  return res.status(401).json({ error: error.message })
                }
  
          })
          
      })
    }
    catch(error) {
      return res.status(400).json({ error: error.message })
    }
  }
}



module.exports = ChangeProfilePhotoController