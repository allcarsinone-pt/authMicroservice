const router = require('express').Router()

router.post('/', async (req, res) => {
  const controller = req.app.get('loginController')
  controller.execute(req, res)
})

router.get('/', async (req, res) => {
  const controller = req.app.get('validateAuthController')
  controller.execute(req, res)
})




module.exports = router