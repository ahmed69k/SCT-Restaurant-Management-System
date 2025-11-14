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
    role:{
        type: String,
        enum: ["User", "Admin", "Staff"],
        required: true
    },
    timestamp:{
        type: Date,
        default: Date.now
    }

})

const User = mongoose.model('User',userSchema)
module.exports = User;