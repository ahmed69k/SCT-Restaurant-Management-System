const userController = require("../Controller/userController")
const express = require("express")
const authorizationMiddleware = require('../Middleware/AuthorizationMiddleware')
const authenticationMiddleware = require('../Middleware/AuthenticationMiddleware')

const router = express.Router()

router.post('/register',userController.register)
router.post('/login',userController.login)
router.delete('/delete/:id',userController.delete)
router.post('/logout',userController.logout)
router.get('/users/:id', userController.getUser)
router.get('/users',authenticationMiddleware,authorizationMiddleware(["Admin"]),userController.getUsers)

module.exports = router;