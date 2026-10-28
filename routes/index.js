const express = require('express')
const router = express.Router()

const api = process.env.BASE_URL
const apiIndex = require('./api/index')

router.use(api, apiIndex)

module.exports = router