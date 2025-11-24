const menuItemController = require('../Controller/menuItemController.js')

// Import your team's real middlewares (note the exact path and .js extension)
const authenticationMiddleware = require('../Middleware/AuthenticationMiddleware.js');
const authorizationMiddleware = require('../Middleware/AuthorizationMiddleware.js');

const express = require('express')
const router = express.Router();

// Public route - anyone can see the menu (no auth needed)
router.get('/', menuItemController.getMenu);
router.get('/all', menuItemController.getAllItems);

// Admin-only routes
router.post('/', authenticationMiddleware, authorizationMiddleware(['admin']), menuItemController.createItem);
router.put('/:id', authenticationMiddleware,authorizationMiddleware(['admin']), menuItemController.updateItem);
router.delete('/:id', authenticationMiddleware,authorizationMiddleware(['admin']), menuItemController.deleteItem);

module.exports = router;