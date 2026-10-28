const userModel = require('../models/userModel');
const bcrypt = require('bcrypt')

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

        const existingUser = await User.findOne({ email });

        if (existingUser) {
        return res.status(400).json({ 
            success: false, 
            message: "This email is already registered" 
        });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        profilePic
        });

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
