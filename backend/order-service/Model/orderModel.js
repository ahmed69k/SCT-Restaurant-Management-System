const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    date: {
        default: Date.now(),
        type: Date
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Preparing','Done', 'Pending'],
        default: 'Pending'
    },
    menuItems: {
        type: [String],
        required: true
    },
    customerId:{
        type: Number,
        required:true
    }
})
module.exports = mongoose.model('Order', orderSchema)