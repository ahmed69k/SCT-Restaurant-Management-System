require('dotenv').config({path: './.env'})
const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./Router/userRouter.js')
const cookieParser = require('cookie-parser')



const app = express()
const port = 3005
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect('mongodb://localhost:27017/user_db')
    console.log("Database connected!")
}
catch(e){
    console.log("Error connecting to db",e)
}
app.use('/api/v1',userRouter)

app.listen(port,()=>{
    console.log(`User Running On ${port}`) 
})