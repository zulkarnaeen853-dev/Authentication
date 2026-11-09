const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')
const authMiddleware = require('../../middlewares/authMiddleware')

router.get('allUser', authMiddleware.protect, authController.getMe)














module.exports = router