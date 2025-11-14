const mongoose = require('mongoose');
const User = require('../user-service/Model/userModel')

const feedbackSchema = mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },
    description: {
        type: String,
        required: false,
    }
})

module.exports = mongoose.model('Feedback', feedbackSchema)