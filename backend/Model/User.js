const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        required: true,
        type: String
    },
    email:{
        required:true,
        type:String,
        unique: true,
        trim: true
    },
    password:{
        required: true,
        type: String,
    },
    timestamp:{
        type: Date,
        default: Date.now
    }

})

const User = mongoose.model('User',userSchema)
module.exports = User;