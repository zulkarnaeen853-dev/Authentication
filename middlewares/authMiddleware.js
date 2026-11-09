const verifyAccessToken = require('../helpers/tokenHelper')

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startWth('Bearer')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Provide a bearer access token'
        })
    }

    const token = authHeader.split(" ")[1]

    try {

        const decoded = verifyAccessToken(token)
        req.user(decoded)
        next()
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
}

module.exports = { protect }