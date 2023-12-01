const router = require('express').Router()

/**
 * @openapi
 * /users/register:
 *
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Register a new user
 *     requestBody:
 *       description: User object
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/RegisterUserRequestBody'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/RegisterUserResponseBody'
 *
 */
router.post('/register', async (req, res) => {
  const controller = req.app.get('registerUserController')
  controller.execute(req, res)
})

router.put('/edit', async (req, res) => {
  const controller = req.app.get('editUserController')
  controller.execute(req, res)
})

router.delete('/delete', async (req, res) => {
  const controller = req.app.get('deleteUserController')
  controller.execute(req, res)
})

router.post('/login', async (req, res) => {
  const controller = req.app.get('loginController')
  controller.execute(req, res)
})

router.get('/validate', async (req, res) => {
  const controller = req.app.get('validateAuthController')
  controller.execute(req, res)
})
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Auth API
 * definitions:
 *   RegisterUserResponseBody:
 *     type: object
 *     required: true
 *     properties:
 *       id:
 *         type: string
 *         description: User id
 *         example: '5f6b0f1d1c9d440000f3b0f1'
 *       name:
 *         type: string
 *         description: User name
 *         example: 'John Doe'
 *       email:
 *         type: string
 *         description: User email
 *         format: email
 *         example: 'johndoe@test.com'
 *       role:
 *         type: string
 *         description: User role
 *         example: 'admin'
 *         enum: ['admin', 'root', 'stand', 'customer']
 *   RegisterUserRequestBody:
 *     type: object
 *     required: true
 *     properties:
 *       name:
 *         type: string
 *         description: User name
 *       email:
 *         type: string
 *         description: User email
 *         format: email
 *         example: 'johndoe@test.com'
 *       password:
 *         type: string
 *         description: User password
 *         example: '12345678'
 *         minLength: 8
 *       confirmPassword:
 *         type: string
 *         description: User password confirmation
 *         example: '12345678'
 *       role:
 *         type: string
 *         description: User role
 *         example: 'admin'
 */
module.exports = router
