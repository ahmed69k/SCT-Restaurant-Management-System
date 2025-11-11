const mongoose = require('mongoose')
const User = require('./User')
const Table = require('./Table')

const orderSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    foodType:{
        type: String,
        enum: ["Pizza","Burger","Pasta","Kid's Meal", "Fries"]
    },
    drink:{
        type:String,
        enum: ["VCola", "VCola Zero", "Water"]
    },
    table:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Table",
        required: false
    },
    reservationTime:{
        type: Date,
        default: Date.now
    },
    numberOfGuests:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:["Ready","Being Prepared","Pending"],
        default: "Pending"


    }

})

module.exports = mongoose.model("Order", orderSchema)