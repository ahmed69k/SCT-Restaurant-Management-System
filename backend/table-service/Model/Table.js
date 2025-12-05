const mongoose = require('mongoose')

 const tableSchema = mongoose.Schema({
    isFree:{
        type:Boolean,
        default: true,
    },
    seatingType:{
        type: String,
        enum: ["Double","Booth","Couch","Table"],
        required:true
    },


 })

 module.exports = mongoose.model('Table', tableSchema)