const userController = require("../Controller/userController")
const express = require("express")
const authorizationMiddleware = require('../Middleware/AuthorizationMiddleware')
const authenticationMiddleware = require('../Middleware/AuthenticationMiddleware')
const serviceAuthMiddleware = require('../Middleware/ServiceAuthMiddleware')

const router = express.Router()

router.post('/register',userController.register)
router.post('/login',userController.login)
router.delete('/users/:id',authenticationMiddleware,authorizationMiddleware(["User", "Admin"]),userController.delete)
router.post('/logout',userController.logout)
router.get('/profile',authenticationMiddleware, authorizationMiddleware(["User","Staff","Admin"]), userController.getCurrentUser)
router.get('/users/:id', userController.getUser)
router.get('/internal/users/:id',serviceAuthMiddleware,userController.getUser)
router.get('/users',authenticationMiddleware,authorizationMiddleware(["User","Admin"]),userController.getUsers)
router.put('/users/update/:id',authenticationMiddleware, authorizationMiddleware(["User", "Admin"]) ,userController.updateUser)

module.exports = router;