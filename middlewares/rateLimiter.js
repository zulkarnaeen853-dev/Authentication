const { rateLimit } = require('express-rate-limit')

const registration = rateLimit({
    windowMs: 900000, 
    limit: 5, 
  skipSuccessfulRequests: true,
  message: { error: "Too many request, please try again later" }
})

const login = rateLimit({
    windowMs: 900000, 
    limit: 5, 
  skipSuccessfulRequests: true,
  message: { error: "Too many request, please try again later" }
})

module.exports = { registration, login}