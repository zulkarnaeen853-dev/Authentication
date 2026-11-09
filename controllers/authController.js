const userModel = require('../models/userModel');
const bcrypt = require('bcrypt')
const {
    hashToken,
    generateSecureToken,
    generateAccessToken,
    generateRefreshToken,
} = require("../helpers/tokenHelper");
const  {
    sendVerificationEmail
} = require('../helpers/emailHelper')

const VERIFICATION_EXPIRE_MS = 86400000
const RESET_EXPIRE_MS = 3600000

const issueAuthTokens = async (user) => {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    user.refreshToken = hashToken(refreshToken)
    await user.save({ validationBeforeSave: false })
    return { accessToken, refreshToken }


}

const registration = async (req, res) => {

    const { name, email, password, role } = req.body;

    try {

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
            role,
            emailVerificationToken: hashToken(plainVerificationToken),
            emailVerificationTokenExpires: new Date(Date.now() + VERIFICATION_EXPIRE_MS)
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
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
}

const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both email and password"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
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
                role: user.role
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

const verifyEmail = async (req, res) => {

    const { token } = req.params

    try {

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            })
        }

        const hashed = hashToken(token)
        const user = await userModel.findOne({
            emailVerificationToken: hashed,
            emailVerificationTokenExpires: { $gt: Date.now() }
        }).select('+emailVerificationToken +emailVerificationTokenExpires')

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired varification token'
            })
        }

        user.isEmailVerified = true
        user.emailVerificationToken = undefined
        user.emailVerificationTokenExpires = undefined
        await user.save({ validationBeforeSave: false })

        return res.status(201).json({
            success: true,
            message: 'Email verified successfully. You can log in now'
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: 'Server error'
        })
    }
}

const resendVerification = async (req, res) => {

    const { email } = req.body

    try {

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            })
        }

        const user = await userModel.findOne({ 
            email
        }).select('+emailVerificationToken, +emailVerificationTokenExpires')

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'If that email is regester, a verification link has been sent'
            })
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            })
        }

        const plainVerificationToken = generateSecureToken()
        user.emailVerificationToken = hashToken(plainVerificationToken)
        user.emailVerificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRE_MS)
        await user.save({ validateBeforeSave: false })
        await sendVerificationEmail(user.email, user.username, plainVerificationToken)

        return res.status(200).json({
                success: true,
                message: 'Verification email sent'
            })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
}

const getMe = async (req, res) => {

    try {
        
        const user = await userModel.findById(req.user.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role
            }
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
}


module.exports = { registration, login, verifyEmail, resendVerification, getMe };
