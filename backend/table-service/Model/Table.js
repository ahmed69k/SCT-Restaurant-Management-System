const mongoose = require('mongoose')

 const tableSchema = mongoose.Schema({
    isFree:{
        type:Boolean,
        default: true,
        required: true,
    },
    seatingType:{
        type: String,
        enum: ["Double","Booth","Couch"],
        required:true
    },


 })

 module.exports = mongoose.model('Table', tableSchema)