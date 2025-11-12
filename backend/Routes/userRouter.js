const userController = require("../Controller/userController")
const express = require("express")

const router = express.Router()

router.post('/register',userController.register)
router.post('/login',userController.login)
router.delete('/delete/:id',userController.delete)
router.post('/logout',userController.logout)

module.exports = router;