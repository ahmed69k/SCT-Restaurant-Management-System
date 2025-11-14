const mongoose = require('mongoose')

const menuitemschema = mongoose.Schema({
    
    name: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: float,
        required: true
    },
    category: {
        type: String,
        enum: ["Appetizer", "Main Course", "Dessert", "Beverage"],
        required: true
    },

})

module.exports = mongoose.model("MenuItem", menuitemschema)