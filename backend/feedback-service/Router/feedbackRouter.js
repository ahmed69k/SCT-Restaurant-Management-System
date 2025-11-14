const feedbackController = require('../Controller/feedbackContoller');
const express = require('express');
const AuthenticationMiddleware = require('../../Middleware/AuthenticationMiddleware');
const AuthorizationMiddleware = require('../../Middleware/AuthorizationMiddleware');

const router = express.Router();

router.post('/feedback',AuthenticationMiddleware, feedbackController.submitFeedback);
router.put('/feedback/:feedbackId', feedbackController.updateFeedback);
router.delete('/feedback/:feedbackId', feedbackController.deleteFeedback);
router.get('/feedback', feedbackController.getAllFeedback);

module.exports = router;