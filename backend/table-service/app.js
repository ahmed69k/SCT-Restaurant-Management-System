require('dotenv').config({path:require('path').resolve(__dirname, '../.env')})
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const tableRouter = require('./Router/tableRouter')



const app = express()
const port = process.env.TABLE_PORT
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

try{
    mongoose.connect('mongodb://localhost:27017/table_db')
    console.log("Database connected!")
}
catch(e){
    console.log("Error connecting to db",e)
}
app.use('/api/v1',tableRouter)

app.listen(port,()=>{
    console.log(`Table Running On ${port}`) 
})