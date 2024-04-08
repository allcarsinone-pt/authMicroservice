const router = require('express').Router()


router.get('/', async (req, res) => {
  const controller = req.app.get('usersUserController')
  controller.execute(req, res)
})

router.post('/', async (req, res) => {
  const controller = req.app.get('registerUserController')
  controller.execute(req, res)
})

router.put('/:username', async (req, res) => {
  const controller = req.app.get('editUserController')
  controller.execute(req, res)
})

router.delete('/:id', async (req, res) => {
  const controller = req.app.get('deleteUserController')
  controller.execute(req, res)
})

/**
 * TODO: Review this functions 

router.patch('/changepwd', async (req, res) => {
  const controller = req.app.get('changePwdUserController')
  controller.execute(req, res)
})

router.put('/changepwdemail', async (req, res) => {
  const controller = req.app.get('changePwdEmailUserController')
  controller.execute(req, res)
})

router.put('/recoverpwd', async (req, res) => {
  const controller = req.app.get('recoverPwdUserController')
  controller.execute(req, res)
})

router.post('/recoverpwdemail', async (req, res) => {
  const controller = req.app.get('recoverPwdEmailUserController')
  controller.execute(req, res)
})

*/








module.exports = router
