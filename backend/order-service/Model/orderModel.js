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
        type: [mongoose.Types.ObjectId],
        required: true
    },
    customerId:{
        type: mongoose.Types.ObjectId,
        required:true
    }
})
module.exports = mongoose.model('Order', orderSchema)