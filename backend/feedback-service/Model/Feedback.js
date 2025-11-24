const mongoose = require('mongoose');
const Reservation = require('../../reservation-service/Model/Reservation');

const feedbackSchema = mongoose.Schema({
    userId:{
        type: String
    },
    rating: {
        type: Number,
        enum: [1,2,3,4,5],
        required: true
    },
    comment: {
        type: String,
        required: false,
    },
    date: {
        type: Date,
        default: Date.now
    },
    Reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true
    },
})

module.exports = mongoose.model('Feedback', feedbackSchema)