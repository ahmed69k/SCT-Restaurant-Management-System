require('dotenv').config();
const express = require('express')
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')

const userRouter = require("./Routes/userRouter");
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
app.use(AuthenticationMiddleware)

app.listen(port,()=>{
    console.log(`Backend Running on port ${port}!`)
})