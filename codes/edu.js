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

app.get('/', function (req, res) {
    res.render('landing');
});

app.get('/signup', function (req, res) {
    res.render('signup');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/access-notes', function (req, res) {
    res.render('login');
});

app.get('/allusers', async function (req, res) {
    const allusers = await userModel.find();
    res.send(allusers);
});

app.get('/count', async (req, res) => {
    const count = await userModel.countDocuments();
    res.send(`<body style="background-color:black; color:#fc3232; font-size:30px; display:flex; justify-content:center; align-items:center;">
            <h1>Total users: ${count}</h1>
        </body>`);
});


// ✅ FIXED TRANSPORTER (IMPORTANT)
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


// OTP generator
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

let otpStore = {};


// SEND OTP
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

    console.log("OTP for testing:", otp); // debug

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'EduShelf OTP Code',
            text: `Your EduShelf OTP is ${otp}. It expires in 5 minutes.`
        });

        res.status(200).send('OTP sent to your email');
    } catch (error) {
        console.error('OTP send error:', error.message || error);
        res.status(500).send('Failed to send OTP');
    }
});


// SIGNUP
app.post('/signup', async function (req, res) {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim();
        const password = req.body.password?.trim();
        const otp = req.body.otp?.trim();

        if (!name || !email || !password || !otp) {
            return res.status(400).send('All fields are required');
        }

        const record = otpStore[email];

        if (!record || record.code.toString() !== otp.toString() || record.expiresAt < Date.now()) {
            return res.status(400).send('Invalid or expired OTP');
        }

        delete otpStore[email];

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).send('Email already registered');
        }

        await userModel.create({
            name,
            email,
            password: await bcrypt.hash(password, 10)
        });

        res.status(200).send('Account created successfully');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});