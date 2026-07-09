const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const subjectsData = require("./subjectsData");
const userModel = require('./models/user');
const supportModel = require("./models/supportModel");

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// FONT-AWESOME CONFIGURATION
app.use("/fontawesome",express.static(
    path.join(process.cwd(), "node_modules/@fortawesome/fontawesome-free")
  )
);

// MULTER CONFIGURATION
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/profile");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});



// GET home page
app.get('/', function (req, res) {
    res.render('landing');
});

// GET all users
app.get('/users', async function (req, res) {
    const users = await userModel.find().sort({ userId: 1 });
    res.render('users', { users });
});
// GET user edit page
app.get('/edit/:id', async (req, res) => {
    const oneuser = await userModel.findById(req.params.id);
    if (!oneuser) {
        return res.send("User not found");
    }
    res.render('edit', { oneuser });
});
// POST user edit page
app.post('/edited/:id', async (req, res) => {
    try {
        let { changedname, changedusername, changedpassword } = req.body;
        let updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            {
                name: changedname,
                username: changedusername,
                password: await bcrypt.hash(changedpassword, 10),
            },
            { returnDocument: 'after' }
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
// POST User page- delete user
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
// GET Total users count
app.get('/count', async (req, res) => {
    const count = await userModel.countDocuments();
    res.send(`<body style="background-color:black; color:#fc3232; font-size:30px; display:flex; justify-content:center; align-items:center;">
            <h1>Total users: ${count}</h1>
        </body>`);
});




// LANDING PAGE--------------------------------------------
// GET Langing page- DECRIPTION button
app.get('/landing-description', function (req, res) {
    res.render('description');
});
// GET Langing page- FEATURES button
app.get('/landing-features', function (req, res) {
    res.render('features');
});
// GET Langing page- HELP button
app.get('/landing-help', function (req, res) {
    res.render('login');
});
// GET Langing page- ACCESS-NOTES button
app.get('/landing-access-notes', function (req, res) {
    res.render('login');
});
// GET Langing page- LOG-IN button
app.get('/landing-login', function (req, res) {
    res.render('login');
});
// GET Langing page- SIGN-UP button
app.get('/landing-signup', function (req, res) {
    res.render('signup');
});
// POST Sending OTP
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
    return Math.floor(100000 + Math.random() * 900000).toString();
}
let otpStore = {};





// SIGNUP PAGE--------------------------------------------------
// POST SIGNUP
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

        const usernameRegex = /^(?=.*[A-Za-z_])[A-Za-z0-9_.]{4,15}$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).send('Invalid username');
        }
        const existingUsername = await userModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).send('Username already taken');
        }
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).send('Email already registered');
        }
        const record = otpStore[email];
        if (
            !record ||
            record.code.toString() !== otp.toString() ||
            record.expiresAt < Date.now()
        ) {
            return res.status(400).send('Invalid or expired OTP');
        }
        delete otpStore[email];

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
        res.render('/login', { username });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// GET login page
app.get('/login', function (req, res) {
    res.render('login');
});




// LOGIN PAGE-------------------------------------------------
// POST login
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

        // Update login timestamps
        user.lastLogin = user.currentLogin;
        user.currentLogin = Date.now();
        await user.save();
        res.send(`/dashboard/${user.username}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// GET signup 
app.get('/signup', function (req, res) {
    res.render('signup');
});
// CHANGE-PASSWORD page--------------------------------------------------------------------------------------------\
app.get("/:username/change-password", async function (req, res) {
    const user = await userModel.findOne({ username: req.params.username });
    res.render("change-password", { user });
})
app.post("/change-password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findOne({ email: req.session.user.email });
    if (!user) {
        return res.json({ success: false, message: "User not found." });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        return res.json({ success: false, message: "Current password is incorrect." });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    res.json({ success: true, message: "Password changed successfully." });

});
// PASSWORD page---------------------------------------------------------------------------------------------------
app.get("/forgot-password", (req, res) => {
    res.render("forgot-password")
})
// Send OTP
app.post("/forgot-password/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Please enter your email." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.json({ success: false, message: "No account found with this email." });
    }

    const otp = generateOTP();
    otpStore[email] = {
        code: otp,
        verified: false,
        expiresAt: Date.now() + 5 * 60 * 1000
    };

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "EduShelf Password Reset OTP",
            html: `
            <h2>Password Reset</h2>
            <p>Hello <b>${user.name}</b>,</p>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>Regards,<br>EduShelf Team</p>
            `
        });
        res.json({ success: true, message: "OTP sent successfully." });
    } catch (err) {
        console.log(err);
        res.json({ success: false, message: "Failed to send OTP." });
    }
});
// Verify OTP
app.post("/forgot-password/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    const storedOTP = otpStore[email];
    if (!storedOTP) {
        return res.json({
            success: false,
            message: "Please request OTP first."
        });
    }

    if (Date.now() > storedOTP.expiresAt) {
        delete otpStore[email];
        return res.json({
            success: false,
            message: "OTP expired."
        });
    }

    if (String(storedOTP.code) !== String(otp)) {
        return res.json({
            success: false,
            message: "Invalid OTP."
        });
    }
    storedOTP.verified = true;

    res.json({
        success: true,
        message: "OTP verified successfully."
    });
});
// Reset Password
app.post("/forgot-password/reset-password", async (req, res) => {
    const { email, password } = req.body;

    const storedOTP = otpStore[email];
    if (!storedOTP || !storedOTP.verified) {
        return res.json({ success: false, message: "Please verify OTP first." });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
        return res.json({ success: false, message: "User not found." });
    }

    const hash = await bcrypt.hash(password, 10);
    user.password = hash;
    await user.save();
    delete otpStore[email];

    res.json({ success: true, message: "Password changed successfully." });
});




// DASGBOARD PAGE---------------------------------------------------------
// GET dashboard
app.get('/dashboard/:username', async function (req, res) {
    let user = await userModel.findOne({ username: req.params.username });
    res.render('dashboard', { user });
});
// GET profile
app.get('/profile/:username', async function (req, res) {
    let user = await userModel.findOne({ username: req.params.username });
    res.render('profile', { user });
});

// PROFILE PAGE---------------------------------------------------------
// GET profile edit page
app.get('/profile-edit/:name', async function (req, res) {
    let user = await userModel.findOne({ name: req.params.name });
    res.render('profile-edit', { user });
});
// POST profile edit page
app.post("/profile/edit", upload.single("profilepicture"), async (req, res) => {
    try {
        const { name, username, dob, phone, semester, branch } = req.body;
        const user = await userModel.findOne({ username });

        if (!user) return res.redirect("/login");
        Object.assign(user, {
            name,
            username,
            dob: dob || null,
            phone: phone || null,
            semester: semester || null,
            branch: branch || null
        });
        if (req.file) {
            if (user.profilepicture && user.profilepicture !== "/images/default-profile.png") {
                const oldPath = path.join(__dirname, "public", user.profilepicture);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            user.profilepicture = "/uploads/profile/" + req.file.filename;
        }
        await user.save();
        res.redirect("/profile/" + user.username);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});
// GET back to dashboard
app.get('/back-to-dashboard/:username', async function (req, res) {
    user = await userModel.findOne({ username: req.params.username });
    res.render('dashboard', { user });
});





// SUPPORT PAGE----------------------------------------------------
app.get('/support/:name', async function (req, res) {
    let user = await userModel.findOne({ name: req.params.name });
    res.render('support', { user });
});
app.post("/support", async (req, res) => {
    const { name, email, category, subject, message } = req.body;
    if (!name || !email || !category || !subject || !message) {
        return res.json({success: false, message: "Please fill all required fields."});
    }

    await supportModel.create({name, email, category, subject, message})
    res.json({success: true,message: "Support request submitted successfully."});
});




// BRANCH PAGES----------------------------------------------------
app.get('/edushelf/:username/branch/:branch', async (req, res) => {
    const branch = req.params.branch;
    const user = await userModel.findOne({ username: req.params.username });
    res.render('semester', { branch, user });
});




// GET subjects page
app.get('/edushelf/:username/branch/:branch/semester/:sem', async (req, res) => {
    const { username, branch, sem } = req.params;
    const user = await userModel.findOne({ username });
    const subjects = subjectsData[branch]?.[sem] || [];
    res.render("subjects", { user, branch, sem, subjects });
});




// GET Resources page-----------------------------------------------------------------------------
app.get('/edushelf/:username/branch/:branch/semester/:sem/subject/:subject', async (req, res) => {
    const user = await userModel.findOne({ username: req.params.username });
    const { branch, sem, subject } = req.params;
    const resources = ["Notes", "Assignments", "Assignment Book", "Lesson Plan", "PYQ", "Quiz"];
    res.render('resources', { branch, sem, subject, resources, user });
});


// GET Resource-list page-----------------------------------------------------------------------------
app.get("/edushelf/:username/branch/:branch/semester/:sem/subject/:subject/resource/:type", async (req, res) => {
    const { username, branch, sem, subject, type } = req.params;
    const user = await userModel.findOne({ username });

    const folderPath = path.join(__dirname, "public", "resources", branch, `sem${sem}`, subject, type.toLowerCase());
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.log(err);
            return res.send("Resource folder not found.");
        }
        // Create pdfFiles
        const pdfFiles = files.filter(file => file.endsWith(".pdf"));
        res.render("resource-list", {user, branch, sem, subject, type, files: pdfFiles});
    });
});


// GET PDF viewer page-----------------------------------------------------------------------------
app.get("/edushelf/:username/:branch/:semester/:subject/:type/:file", (req, res) => {
    console.log(req.params.file);
    res.render("pdf-viewer", {username: req.params.username, branch: req.params.branch, sem: req.params.semester, subject: req.params.subject, type: req.params.type, file: req.params.file});
});





// local host 3000 port
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});