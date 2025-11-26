require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express')
const cookieParser = require('cookie-parser')
const orderRouter = require('./Router/orderRouter')
const mongoose = require('mongoose')

const port = process.env.ORDER_PORT;
const app = express()
const db_url = process.env.DB_URL;

app.use(cookieParser())
app.use(express.json())

app.use('/api/v1/order', orderRouter)

try{
    mongoose.connect('mongodb://localhost:27017/order_db')
    console.log("Database Connected!")
}
catch(e){
    console.log("Error connecting to DB!",e)
}

app.listen(port, ()=>{
    console.log(`Order running on ${port}`)
})
