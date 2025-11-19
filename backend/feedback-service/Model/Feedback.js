const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    userId:{
        type: String
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