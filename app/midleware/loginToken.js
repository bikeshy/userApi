const jwt =require("jsonwebtoken");
require('dotenv').config();
const Refrace = require("../modals/refreshModel");


/*
*
**get refresh token 
*
*/
exports.getaccesstoken = async (req, res, next) => {
    const token = req.headers.accesstoken;

    // Check if the token is provided
    if (!token) {
        return res.status(401).json({
            successStatus: false,
            statusCode: 401,
            msg: "Refresh authentication failed! Token not found."
        });
    }

    try {
        const refrace = await Refrace.findOne({ token });
        // Check if the token exists in the database
        if (!refrace) {
            return res.status(401).json({
                successStatus: false,
                statusCode: 401,
                msg: "Refresh authentication failed! Token not valid."
            });
        }

        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);

        // Attach decoded token data (userId, uuid) to request object
        req.userData = { userId: decodedToken.userId, token: decodedToken.token, requestId:decodedToken.requestId };

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.log("Error verifying token:", error);

        return res.status(401).json({
            successStatus: false,
            statusCode: 401,
            msg: "Refresh authentication failed! Invalid token."
        });
    }
};

/*
*
** login user
*
*/
exports.getUserData = (req, res, next) => {
    const token = req.headers.accesstoken; 

    if (!token) {
        return res.status(401).json({
            successStatus: false,
            statusCode: 401,
            msg: "Authentication failed! Token not found."
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        next();
    } catch (error) {
        console.log(error);
        
        return res.status(401).json({
            successStatus: false,
            statusCode: 401,
            msg: "Authentication failed! Invalid token."
        });
    }
};