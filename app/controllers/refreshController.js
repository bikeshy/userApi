const Refrace = require("../modals/refreshModel");
const jwt = require("jsonwebtoken");
const uuid = require('uuid');

// Create Token
exports.createToken = async (req, res, next) => {
    try {
        const refrace = await Refrace.find({}); 
        const newUuid = uuid.v4(); 

        // Generate JWT token
        const newToken = jwt.sign(
            {
                requestId:req.requestId,
                userId: "",
                token:"ksCR+uAGYbNjIIPNXfwgpa7O2nQsZDYB7OcYb9K0TmCX9DJPe0rT32sDKO+yZmAR"
            },
            process.env.JWT_SECRETKEY
        );

        // If a token already exists, update it
        if (refrace.length > 0) {
            await  Refrace.findByIdAndUpdate(
                refrace[0]._id, 
                { token: newToken }, 
                { new: true }
            );

            return res.status(201).json({
                successStatus: true,
                statusCode: 201,
                data: {
                    accessToken: newToken
                },
            });
        } else {
            // If no token exists, create a new one
            const refraceToken = new Refrace({
                token: newToken, 
            });

            await refraceToken.save();

            return res.status(201).json({
                successStatus: true,
                statusCode: 201,
                data: {
                    accessToken: refraceToken.token
                },
            });
        }

    } catch (error) {
        console.error('Error:', error); 
        return res.status(500).json({
            successStatus: false,
            statusCode: 500,
            message: 'Internal server error',
            error: error.message 
        });
    }
};
