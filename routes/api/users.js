const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken') // for the auth and userid
const { check, validationResult } = require('express-validator') //validator
const bcrypt = require('bcryptjs') //encrypting
const User = require('../../models/User') //model

//This is the register route in case we need it.
//As of now this page is unused, only to manually create users via
//postman

//@route  POST api/users
//@desc   register user
//@access public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body

    try {
      let user = await User.findOne({ email })

      //Check if user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'user Already exists' }] })
      }

      user = new User({
        email,
        password
      })

      //encrypt password

      const salt = await bcrypt.genSalt(10) //to hash
      user.password = await bcrypt.hash(password, salt) // we encrypt thepassword here

      await user.save()

      //return jsonwebtoken so a registered user is instantly logged in
      const payload = {
        user: {
          id: user.id
        }
      }
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
