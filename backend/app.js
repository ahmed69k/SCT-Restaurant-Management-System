require('dotenv').config();
const express = require('express')
const mongoose = require("mongoose")

const userRouter = require("./Routes/userRouter")

const app = express()
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

app.listen(port,()=>{
    console.log("Backend Running!")
})