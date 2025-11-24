require('dotenv').config({path: './.env'})
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')



const app = express()
const port = 3003
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect('mongodb://localhost:27017/order_db')
    console.log("Database connected!")
}
catch(e){
    console.log("Error connecting to db",e)
}

app.listen(port,()=>{
    console.log(`Reservation Running On ${port}`) 
})