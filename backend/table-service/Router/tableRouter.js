const tableController = require('../Controller/tableController');
const express = require('express');
const AuthenticationMiddleware = require('../Middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../Middleware/AuthorizationMiddleware');

const router = express.Router();

router.post('/tables', AuthenticationMiddleware, tableController.createTable);
router.put('/tables/:tableId', AuthenticationMiddleware, tableController.updateTable);
router.delete('/tables/:tableId', AuthenticationMiddleware, tableController.deleteTable);
router.get('/tables', AuthorizationMiddleware, tableController.getAllTables);
router.get('/tables/available', tableController.getAvailableTables);
router.get('/tables/:tableId', tableController.getTableById);
router.patch('/tables/:tableId/status', AuthenticationMiddleware, tableController.updateTableStatus);

module.exports = router;