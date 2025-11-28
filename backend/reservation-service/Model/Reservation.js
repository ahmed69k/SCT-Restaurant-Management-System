const mongoose = require('mongoose')

const reservationSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required:true
    },
    numberOfGuests:{
        type: Number, 
        required: true
    },
    status:{
        type: String,
        enum:["Ready","Being Prepared","Pending"],
        default: "Pending"
    },
    table:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: false
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // menuItems: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "MenuItem"
    // }],

})

module.exports = mongoose.model("Reservation", reservationSchema)