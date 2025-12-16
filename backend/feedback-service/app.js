require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express')
const mongoose = require('mongoose')
const feedbackRouter = require('./Router/feedbackRouter.js')
const cookieParser = require('cookie-parser')
const cors = require('cors')



const app = express()
const port = process.env.FEEDBACK_PORT;
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_LINK,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect('mongodb://localhost:27017/feedback_db')
    console.log("Database connected!")
}
catch(e){
    console.log("Error connecting to db",e)
}
app.use('/api/v1/feedback',feedbackRouter)

app.listen(port,()=>{
    console.log(`Feedback Running On ${port}`) 
})