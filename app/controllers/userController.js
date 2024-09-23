const Users = require("../modals/usersModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const fs = require('fs');
const crypto = require("crypto");
const path = require('path');
const forge = require("node-forge");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const twilio = require('twilio');

/*
**
*** Twilio credentials
**
*/
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = new twilio(accountSid, authToken);

// const accountSid = 'AC2600b067455bb9e814a03a47ad784909';
// const authToken = '631658de0a94a33d779e23dd9266cba8';
const client = new twilio(accountSid, authToken);

/*
**
*** RSA keys 
**
*/
 const privateKeyPem = fs.readFileSync(path.join(__dirname,'../midleware/private.pem'), 'utf8');
 const publicKeyPem = fs.readFileSync(path.join(__dirname,'../midleware/publickey.pem'), 'utf8');


/*
**
*** User register
**
*/
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({
            name: name,
            email: email,
            password: hashedPassword,
            status: "1"
        });

        await newUser.save();

            const token = jwt.sign(
                {
                    userId: newUser.id,
                    email: newUser.email
                },
                process.env.JWT_SECRETKEY, 
                { expiresIn: "1h" }
            );

            const encryptedData = crypto.publicEncrypt(
                publicKeyPem,
                Buffer.from(newUser.email)
            );
        
            //   res.json({ data: encryptedData.toString("base64") });
            console.log("Encrypted data:", encryptedData.toString("base64"));
            const decryptedData = crypto.privateDecrypt(
                privateKeyPem,
                encryptedData
            );
            
            console.log("Decrypted data:", decryptedData.toString());

        return res.status(201).json({
            successStatus: true,
            statusCode: 201,
            data: {
                userId: newUser.id,
                email:decryptedData.toString(),
                emailencrypt:encryptedData.toString("base64"),
                token: token
            },
            message: 'User registered successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            successStatus: false,
            statusCode: 500,
            msg: "Internal server error"
        });
    }
};

/*
**
*** User login
**
*/

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await Users.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                successStatus: false,
                statusCode: 401,
                msg: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                successStatus: false,
                statusCode: 401,
                msg: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRETKEY,
            { expiresIn: "30m" }
        );
        // res.cookie('accesstoken', token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     maxAge: 3600000 // 1 hour in milliseconds
        // });

        return res.status(200).json({
            successStatus: true,
            statusCode: 200,
            msg: "Logged in successfully!",
            data: {
                userId: user.id,
                email: user.email,
                token: token
            }
        });
    } catch (error) {
        return res.status(500).json({
            successStatus: false,
            statusCode: 500,
            msg: "Internal server error"
        });
    }
};


/*
**
*** User list
**
*/
exports.userList = async (req, res, next) => {
    try {
        const users = await Users.find({});
        return res.status(200).json({
            data: users
        });
    } catch (error) {
        return next(error);
    }
};

exports.getUserID = async (req, res, next) => {
    try {
        const userID = req.headers.id;
        const user = await Users.findById(userID);

        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        return res.status(200).json({
            data: user,
            message: "One User list"
        });
    } catch (error) {
        return next(error);
    }
};

/*
**
*** User update
**
*/

exports.updateUser = async (req, res, next) => {
    try {
        const userID = req.headers.id;
        const update = req.body;

        const user = await Users.findByIdAndUpdate(userID, update, { new: true });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            data: user,
            message: 'User has been updated'
        });
    } catch (error) {
        return next(error);
    }
};

/*
**
*** User delete
**
*/

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.headers.id;
        const user = await Users.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }

        return res.status(200).json({
            data: user,
            message: "User has been deleted"
        });
    } catch (error) {
        return next(error);
    }
};

/*
**
*** Generate 6-digit OTP
**
*/

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
/*
**
*** Store OTPs in an in-memory object (this could be replaced by a database in production)
**
*/
  const otpStore = {};
 /*
**
*** Set up Nodemailer transporter
**
*/ 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bikesh.kumar@abym.in',
      pass: 'rtwh fitq hknd hcjw', // App password for Gmail
    },
  });
/*
**
*** Function to send OTP email
**
*/
  async function sendOTPEmail(toEmail, otp) {
    const mailOptions = {
      from: 'bikesh.kumar@abym.in',
      to: toEmail,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('OTP sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw error to handle it in the calling function
    }
  }
  /*
**
*** Send OTP email
**
*/
  exports.sendEmailOtp = async (req, res) => {
    const email = req.body.email;
  
    if (!email) {
      return res.status(400).send('Email is required');
    }
  
    const otp = generateOTP();
  
    // Store the OTP with a timestamp for later verification
    otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Valid for 5 minutes
  console.log("email",email);
  console.log("email",otp);
    try {
      // Send OTP to the email
      await sendOTPEmail(email, otp);
      res.status(200).send('OTP sent successfully');
    } catch (error) {
      res.status(500).send('Error sending OTP');
    }
  };
  
/*
**
*** Verify email OTP
**
*/
  exports.verifyEmailOtp = (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return res.status(400).send('Email and OTP are required');
    }
  
    const storedOTPData = otpStore[email];
  
    if (!storedOTPData) {
      return res.status(400).send('OTP not found or expired');
    }
  
    const { otp: storedOtp, expiresAt } = storedOTPData;
  
    // Check if OTP is expired
    if (Date.now() > expiresAt) {
      delete otpStore[email]; // Clean up expired OTP
      return res.status(400).send('OTP expired');
    }
  
    // Check if OTP matches
    if (storedOtp === otp) {
      delete otpStore[email]; // OTP verified, remove from store
      return res.status(200).send('OTP verified successfully');
    } else {
      return res.status(400).send('Invalid OTP');
    }
  };

/*
**
*** Generate a random mobile OTP and send mobile OTP
**
*/
const generateMobileOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendMobileOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).send({ message: 'Phone number is required' });
  
    const otp = generateMobileOTP();
    otpStore[phoneNumber] = otp; 
    
   const mg = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '+14159642109',
        to: phoneNumber
      })
      .then(message => res.send({ message: 'OTP sent successfully' }))
      .catch(err => res.status(500).send({ message: 'Error sending OTP', error: err.message }));
  };

/*
**
*** Verify  mobile OTP
**
*/
  exports.verifyMobileOtp = async  (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) return res.status(400).send({ message: 'Phone number and OTP are required' });
  
    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp) return res.status(400).send({ message: 'No OTP sent to this phone number' });
  
    if (storedOtp === otp) {
      delete otpStore[phoneNumber]; 
      res.send({ message: 'OTP verified successfully' });
    } else {
      res.status(400).send({ message: 'Invalid OTP' });
    }
  };