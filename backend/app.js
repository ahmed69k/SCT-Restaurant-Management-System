require('dotenv').config();
const express = require('express')
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')

const userRouter = require("./user-service/Router/userRouter");
const feedbackRouter = require('./feedback-service/Router/feedbackRouter')
const AuthenticationMiddleware = require('./Middleware/AuthenticationMiddleware');

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect("mongodb://localhost:27017")
    console.log("Database Connected!")
}
catch(e){
    console.log(e)
}

const port = process.env.PORT;
app.use("/api/v1", userRouter)
app.use('/api/v1',feedbackRouter)


app.listen(port,()=>{
    console.log(`Backend Running on port ${port}!`)
})