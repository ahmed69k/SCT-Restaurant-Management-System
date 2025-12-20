const feedbackController = require('../Controller/feedbackContoller');
const express = require('express');
const AuthenticationMiddleware = require('../Middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../Middleware/AuthorizationMiddleware');

const router = express.Router();

router.post('/',AuthenticationMiddleware, feedbackController.submitFeedback);
router.delete('/:feedbackId', feedbackController.deleteFeedback);
router.get('/', feedbackController.getAllFeedback);

module.exports = router;