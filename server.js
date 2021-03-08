const express = require('express')
const connectDB = require('./config/db')
const path = require('path')
require('dotenv').config()

const app = express()

//connect database
connectDB(process.env.MONGO_URI)

//init middleware
app.use(express.json({ extended: false }))

const allowCrossDomain = (req, res, next) => {
  //middleware for cors access
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth-token')
  next()
}
app.use(allowCrossDomain)

//define routes

app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/pages', require('./routes/api/pages'))
app.use('/api/users', require('./routes/api/users'))

//serve static assets in production
if (process.env.NODE_ENV === 'production') {
  //set static folder
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server stated on port ${PORT}`))
