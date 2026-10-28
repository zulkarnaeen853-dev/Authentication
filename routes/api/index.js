const express = require('express')
const router = express.Router()


const AuthRoute = require('./authRoute')

router.use("/auth", AuthRoute)

module.exports = router