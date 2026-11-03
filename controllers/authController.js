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
const VERIFICATION_EXPIRE_MS = Number(
    process.env.VERIFICATION_EXPIRE_MS || 24 * 60 * 60 * 1000
)
const RESET_EXPIRE_MS = process.env.RESET_EXPIRE_MS

const registration = async (req, res) => {

    try {

        const { name, email, password, profilePic } = req.body;

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
            profilePic,
            emailVerificationToken: hashToken(plainVerificationToken),
            emailVerificationTokenExpires: new Date(Date.now() + VERIFICATION_EXPIRE_MS),
        });

        try {
            await sendVerificationEmail(newUser.email, newUser.name, plainVerificationToken)
        } catch (mailError) {
            await userModel.findByIdAndDelete(newUser._id)
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
                profilePic: newUser.profilePic
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

        const user = await userModel.findOne({email})

        if(!user) {
            return res.status(400).json({ 
            success: false, 
            message: "User does not exist", 
        });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}



module.exports = { registration, login };
