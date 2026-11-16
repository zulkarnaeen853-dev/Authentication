const userModel = require('../models/userModel');

const getAllUser = async (req, res) => {

    try {
        
        const loggedinUserId = req.user.id
        const loggedinUser = await userModel.findById(loggedinUserId)
        console.log(loggedinUser)
        // const users = await userModel.find()

        // res.status(200).json({
        //     success: true,
        //     message: 'User get successfully', 
        //     data: users
        // })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
        });
    }
}

module.exports = { getAllUser }