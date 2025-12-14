require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./Router/userRouter.js')
const cookieParser = require('cookie-parser')
const cors = require('cors')



const app = express()
app.use(cors({
    origin: process.env.FRONTEND_LINK,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const port = process.env.USER_PORT || 3000
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