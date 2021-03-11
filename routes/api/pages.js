const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const axios = require('axios')
const auth = require('../../middleware/auth')
const Page = require('../../models/Page')
require('dotenv').config()

//@route  POST api/pages
//@desc   create a page
//@access private
router.post(
  '/',
  auth,
  check('pageName', 'Page name is required').notEmpty(),
  async (req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty) {
      return res.status(400).json({ errors: errors.array() })
    }
    const repeated = await Page.findOne({ pageName: `${req.body.pageName}` })
    if (repeated) {
      return res.status(400).send('Repeated page name')
    }

    try {
      // get a new dynamic link from google
      const dynamicLinkData = JSON.stringify({
        dynamicLinkInfo: {
          link: 'https://rob-test-a493c.web.app/appNotDownloaded',
          domainUriPrefix: 'https://robtest.page.link'
        },
        suffix: {
          option: 'UNGUESSABLE'
        }
      })

      const {
        data: { shortLink }
      } = await axios.post(
        `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.FIREBASE_API_KEY}`,
        dynamicLinkData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      const newPage = new Page({
        user: req.user.id,
        pageName: req.body.pageName,
        shareLink: shortLink
      })
      const page = await newPage.save()
      res.json(page)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

//@route  GET api/pages
//@desc  get all pages
//@access public
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find().sort({ date: -1 }) // sort by most recent
    res.json(pages)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route  GET api/pages/:id
//@desc  get page by name
//@access public
router.get('/:pageName', async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: `${req.params.pageName}` })
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' }) // for when there is not a page
    }
    res.json(page)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Page not found' }) // forwhen the id is not valid
    }
    res.status(500).send('Server Error')
  }
})

//@route  Delete api/pages/:id
//@desc  delete page by id
//@access private
router.delete('/:id', auth, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
    if (!page) {
      return res.status(404).json({ msg: 'page not found' }) // forwhen there is not a page
    }

    if (page.user.toString() !== req.user.id) {
      //check the page belong to the logged in user
      return res.status(401).json({ msg: 'user not authorized' })
    }
    await page.remove()
    res.json({ msg: 'page removed' })
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'page not found' }) // forwhen the id is not valid
    }
    res.status(500).send('Server Error')
  }
})

module.exports = router
