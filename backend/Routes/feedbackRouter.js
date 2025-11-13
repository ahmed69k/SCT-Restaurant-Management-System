const feedbackController = require('../Controllers/feedbackController');
const express = require('express');

const router = express.Router();

router.post('/submit', feedbackController.submitFeedback);
router.put('/update/:feedbackId', feedbackController.updateFeedback);
router.delete('/delete/:feedbackId', feedbackController.deleteFeedback);
router.get('/all', feedbackController.getAllFeedback);

module.exports = router;