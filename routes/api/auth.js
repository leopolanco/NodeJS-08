const express = require('express')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const router = express.Router()
const User = require('../../models/User')

//@route  GET api/auth
//@desc   get user info
//@access public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

//@route  POST api/auth
//@desc   authenticate users & get token
//@access public
router.post(
  '/',
    check('email', 'Invalid credentials').isEmail(),
    check('password', 'Invalid credentials').exists(),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
      //if there is an error the program sends back a 400 error
      //and a message, which is the same we described in check()
    }
    const { email, password } = req.body //destructuring req.body

    try {
      let user = await User.findOne({ email }) //request to the database the user info

      //Check if user exists
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })
      }

      const isMatch = await bcrypt.compare(password, user.password) //comparing the
      //password ingresada to the password registered

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] })
      }

      //return jsonwebtoken so a registered user is instantly logged in
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      );
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
);

module.exports = router
