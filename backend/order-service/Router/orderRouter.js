const express = require('express')
const AuthenticationMiddleware = require('../Middleware/AuthenticationMiddleware')
const AuthorizationMiddleware = require('../Middleware/AuthorizationMiddleware')
const orderController = require('../Controller/orderController')
const router = express.Router()

router.post('/',AuthenticationMiddleware, AuthorizationMiddleware(['User']),orderController.placeOrder)
router.delete('/:id',AuthenticationMiddleware, AuthorizationMiddleware(['User']), orderController.cancelOrder)

module.exports = router;