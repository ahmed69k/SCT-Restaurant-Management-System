const tableController = require('../Controller/tableController');
const express = require('express');
const AuthenticationMiddleware = require('../Middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../Middleware/AuthorizationMiddleware');
const serviceAuthMiddleware = require('../Middleware/ServiceAuthMiddleware')

const router = express.Router();

router.post('/tables', AuthenticationMiddleware, AuthorizationMiddleware(['Admin', 'Staff']), tableController.createTable);
router.get('/tables', AuthenticationMiddleware, AuthorizationMiddleware(['Admin', 'Staff']), tableController.getAllTables); // FIXED
router.put('/tables/:tableId', AuthenticationMiddleware, AuthorizationMiddleware(['Admin', 'Staff']), tableController.updateTable);
router.delete('/tables/:tableId', AuthenticationMiddleware, AuthorizationMiddleware(['Admin']), tableController.deleteTable);
router.get('/tables/available', AuthenticationMiddleware, AuthorizationMiddleware(['Admin', 'Staff']), tableController.getAvailableTables);
router.get('/tables/:tableId', AuthenticationMiddleware, AuthorizationMiddleware(['Admin', 'Staff']), tableController.getTableById);
router.patch('/tables/:tableId/status', AuthenticationMiddleware, AuthorizationMiddleware(['Admin']), tableController.updateTableStatus);
router.get('/internal/tables/:tableId', serviceAuthMiddleware, tableController.getTableById);

module.exports = router;