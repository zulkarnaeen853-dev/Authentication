const userModel = require('../models/userModel');
const bcrypt = require('bcrypt')
const {
    hashToken,
    generateSecureToken,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken, 
    verifyRefreshToken 
} = require("../helpers/tokenHelper");
const  {
    sendVerificationEmail
} = require('../helpers/emailHelper')

const issueAuthTokens = async (user) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    user.refreshToken = hashToken(refreshToken)
    await user.save({ validationBeforeSave: false })
    return { accessToken, refreshToken }


}

const registration = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Please fill in all fields (name, email, password)" 
        });
        }

        if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 6 characters long" 
        });
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: "This email is already registered" 
        });
        }

        const plainVerificationToken = generateSecureToken();

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            name,
            email,
            password:hashedPassword,
            emailVerificationToken: hashToken(plainVerificationToken),
            emailVerificationTokenExpires: new Date(Date.now() + process.env.VERIFICATION_EXPIRE_MS),
        });

        try {
            await sendVerificationEmail(newUser.email, newUser.name, plainVerificationToken)
        } catch (mailError) {
            await userModel.findByIdAndDelete(newUser.id)
            console.error(`Verification email failed:${mailError}`)
            return res.status(500).json({
                success: false,
                message: "Registration failed: could not send verification email",
        });

        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            }
        });

    } catch (error) {
        console.error("Registration failed:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
};

const login = async (req, res) => {

    try {

        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }

        const user = await userModel.findOne({email})

        const isMatch = await bcrypt.compare(password, user.password)

        if (!user || !isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Your email address is not verified. Please check your inbox for the verification link."
            });
        }   

        const { accessToken, refreshToken } = await issueAuthTokens(user)

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            },
            accessToken,
            refreshToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}



module.exports = { registration, login };
