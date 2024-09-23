const users = require("../app/controllers/userController.js");
const RefraceToken = require("../app/controllers/refreshController.js");
const token=require("../app/midleware/accessToken.js");
var router = require("express").Router();
const {getUserData,getaccesstoken} =require('../app/midleware/loginToken.js')



router.post("/refraceToken", token, RefraceToken.createToken);

router.post("/register", token, getaccesstoken, users.register);

router.post("/login", token, getaccesstoken, users.login);

router.get("/userlist", token, getUserData, users.userList);

router.post('/send-otp',token,users.sendEmailOtp),

router.post('/verify-otp',token, users.verifyEmailOtp),

router.post('/mobile-send-otp',token,users.sendMobileOtp),

router.post('/mobile-verify-otp',token, users.verifyMobileOtp),




module.exports = router;