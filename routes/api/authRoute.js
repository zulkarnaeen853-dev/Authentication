const express = require('express')
const router = express.Router()

const authController = require('../../controllers/authController')
const authMiddleware = require('../../middlewares/authMiddleware')
const rateLimiter = require('../../middlewares/rateLimiter')

router.post('/register', rateLimiter.registration, authController.registration)
router.post('/login', rateLimiter.login, authController.login)

router.get('/verify-email/:token', authController.verifyEmail)

router.post('/resend-verification', authController.resendVerification)

router.get('/me', authMiddleware.protect, authController.getMe)

module.exports = router