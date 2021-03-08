const jwt = require('jsonwebtoken')
require('dotenv').config()

//Middleware to check the token

module.exports = function (req, res, next) {
  //get token from header
  const token = req.header('x-auth-token')

  //check if not token
  if (!token) {
    //this would run if there's no token
    return res.status(401).json({ msg: 'No token. Authorization Denied' })
  }
  //verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded.user
    next()
  } catch (err) {
    //this would run if the token is not valid
    res.status(401).json({ msg: 'Token is no valid' })
  }
}
