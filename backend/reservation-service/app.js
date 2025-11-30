require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const reservationRouter = require('./Router/reservationRouter')



const app = express()
const port = process.env.RESERVATION_PORT
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect('mongodb://localhost:27017/reservation_db')
    console.log("Database connected!")
}
catch(e){
    console.log("Error connecting to db",e)
}
app.use('/api/v1/reservations',reservationRouter)

app.listen(port,()=>{
    console.log(`Reservation Running On ${port}`) 
})