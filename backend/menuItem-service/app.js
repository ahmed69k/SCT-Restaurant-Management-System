require('dotenv').config()
const express = require('express')
const cookieParse = require('cookie-parser')

const port = process.env.PORT
const app = express()

app.listen(port, ()=>{
    console.log(`Menu Item Running On ${port}`)
})

