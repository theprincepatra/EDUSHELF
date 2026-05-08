const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();
const path = require('path');
require('dotenv').config();

const userModel = require('./models/user');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// home page
app.get('/', function (req, res) {
    res.render('landing');
});

// all users
app.get('/users', async function (req, res) {
    const users = await userModel.find().sort({ userId: 1 });
    res.render('users', { users });
});
// User page- edit user page
app.get('/edit/:id', async (req, res) => {
    const oneuser = await userModel.findById(req.params.id);
    if (!oneuser) {
        return res.send("User not found");
    }
    res.render('edit', { oneuser });
});
// User page- edit user for submit button
app.post('/edited/:id', async (req, res) => {
  try {
    let { changedname, changedusername, changedpassword } = req.body;
    let updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      {
        name: changedname,
        username: changedusername,
        password: changedpassword
      },
      {returnDocument: 'after'}
    );
    console.log("Updated user:", updatedUser);
    if (!updatedUser) {
      return res.send("User not found");
    }
    res.send("User updated successfully");
  } catch (err) {
    console.error(err);
    res.send("Error updating user");
  }
});
// User page- delete user
app.post('/delete/:id', async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    console.log("Deleted user:", deletedUser);
    if (!deletedUser) {
      return res.send("User not found");
    }
    res.send("User deleted successfully");
  } catch (err) {
    console.error(err);
    res.send("Error deleting user");
  }
});
// Total users count
app.get('/count', async (req, res) => {
    const count = await userModel.countDocuments();
    res.send(`<body style="background-color:black; color:#fc3232; font-size:30px; display:flex; justify-content:center; align-items:center;">
            <h1>Total users: ${count}</h1>
        </body>`);
});


// LANDING PAGE--------------------------------------------
// Langing page- DECRIPTION button
app.get('/landing-description', function (req, res) {
    res.render('description');
});
// Langing page- FEATURES button
app.get('/landing-features', function (req, res) {
    res.render('features');
});
// Langing page- HELP button
app.get('/landing-help', function (req, res) {
    res.render('login');
});
// Langing page- ACCESS-NOTES button
app.get('/landing-access-notes', function (req, res) {
    res.render('login');
});
// Langing page- LOG-IN button
app.get('/landing-login', function (req, res) {
    res.render('login');
});
// Langing page- SIGN-UP button
app.get('/landing-signup', function (req, res) {
    res.render('signup');
});
// Sending OTP
app.post('/send-otp', async function (req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required');
    }
    const otp = generateOTP();
    otpStore[email] = {
        code: otp,
        expiresAt: Date.now() + 5 * 60 * 1000
    };
    console.log("OTP:", otp);

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EduShelf OTP Code',
            text: `Hi [User Name],
    Your verification code is: [OTP CODE]

    This code will expire in a few minutes. Please do not share it with anyone.
    If you did not request this, you can safely ignore this email.

    Regards,
    Team EduShelf`.replace('[OTP CODE]', otp).replace('[User Name]', email.split('@')[0])
        });
        res.status(200).send('OTP sent to your email');
    } catch (error) {
        console.error('OTP send error:', error.message || error);
        res.status(500).send('Failed to send OTP');
    }
});


// OTP maker-------------------------
// TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }    
});    
transporter.verify(function (error, success) {
    if (error) {
        console.error('Email transporter verification failed:', error.message);
    } else {
        console.log('Email transporter is ready to send messages');
    }    
});    
// Generator
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}    
let otpStore = {};

// SIGNUP
app.post('/signup', async function (req, res) {
    try {
        const name = req.body.name?.trim();
        const username = req.body.username?.trim();
        const email = req.body.email?.trim();
        const password = req.body.password?.trim();
        const otp = req.body.otp?.trim();

        if (!name || !username || !email || !password || !otp) {
            return res.status(400).send('All fields are required');
        }
        if (!username) {
            return res.status(400).send('Username is required');
        }
        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).send('Username already taken');
        }

        const record = otpStore[email];
        if (!record || record.code.toString() !== otp.toString() || record.expiresAt < Date.now()) {
            return res.status(400).send('Invalid or expired OTP');
        }
        delete otpStore[email];

        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).send('Email already registered');
        }

        let lastUser = await userModel.findOne().sort({ userId: -1 });
        let newUserId = lastUser ? lastUser.userId + 1 : 1;
        await userModel.create({
            userId: newUserId,
            name,
            username,
            email,
            password: await bcrypt.hash(password, 10),
        });
        res.status(200).send('Account created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


// LOG IN
app.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid password');
        }

        res.status(200).send('Login successful');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});