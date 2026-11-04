const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
}

const generateSecureToken = () => { 
    return crypto.randomBytes(32).toString("hex"); 
}

const generateAccessToken = (user) => {
    const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expireIn: process.env.JWT_ACCESS_EXPIRE || '15m'
  })

}

// const generateRefreshToken = (user) => {
//   const payload = { id: user._id };
//   return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
//     expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
//   });
// };

// const verifyAccessToken = (token) =>
//   jwt.verify(token, process.env.JWT_SECRET);

// const verifyRefreshToken = (token) =>
//   jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { 
    hashToken, 
    generateSecureToken, 
    generateAccessToken,
}