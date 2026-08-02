const express = require("express");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();
const path = require('path');
const fs = require('fs');
const mongoose = require("mongoose");
const session = require("express-session");

const MongoStore = require("connect-mongo").default;
require('dotenv').config();
mongoose.connect("mongodb://127.0.0.1:27017/siginupDB")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// const resource = require("./models/resource");
const Resource = require("./models/resourceModel");
const subjectsData = require("./subjectsData");
const userModel = require('./models/userModel');
const adminModel = require("./models/adminModel");
const subcriptionModel = require("./models/subscriptionModel");
const SupportModel = require("./models/support-ticketModel");

const isLoggedIn = require("./middleware/isLoggedIn");
const adminLoggedIn = require("./middleware/adminLoggedIn");

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: "mongodb://127.0.0.1:27017/edushelf"
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: "lax"
        }
    })
);

app.use(express.static(path.join(__dirname, 'public')));

// FONT-AWESOME CONFIGURATION
app.use("/fontawesome",express.static(
    path.join(process.cwd(), "node_modules/@fortawesome/fontawesome-free")
  )
);

// MULTER CONFIGURATION for profile picture upload
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



// ADMIN page----------------------------------------------------------------------------------------
app.get("/admin/login", (req, res) => {
    if (req.session.adminId) {
        return res.redirect("/admin/a-dashboard");
    }
    res.render("admin/a-login");
});
// POST admin login
app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;
    admin = await adminModel.findOne({email});

    const isMatch = bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.send("Invalid Password");
    }
    req.session.adminId = admin._id;
    res.redirect("/admin/a-dashboard");
});

// Admin dashboard page---------------------------------------------------------------------------
app.get("/admin/a-dashboard", adminLoggedIn, async (req, res) => {
    const totalUsers = await userModel.countDocuments();
    const totalResources = await Resource.countDocuments();
    const recentRegistrations = await userModel.find().sort({ joinedon: -1 }).limit(10);

    res.render("admin/a-dashboard", {admin:req.admin, totalUsers, totalResources, totalRevenue:0, premiumUsers:0, newRegistrations:0, activeSubscriptions:0, freeUsers:0, supportTickets:0, premiumPercentage:0, freePercentage:0, recentRegistrations});
});

// Admin User Page------------------------------------------------------------------------------------
app.get("/admin/a-users", adminLoggedIn, async (req, res) => {
    const users = await userModel.find();
    const totalUsers = await userModel.countDocuments();
    res.render("admin/a-users", {admin: req.admin, users, totalUsers});
});



// GET home page----------------------------------------------------------------------------------------
app.get("/", async (req, res) => {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.render("landing");

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
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
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





// SIGNUP PAGE---------------------------------------------------------------------------------------------------

// GET SIGN UP page
app.get('/signup', async (req,res) => {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.render('signup');
});
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





// LOGIN PAGE-------------------------------------------------
// GET login page
app.get('/login', function (req, res) {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.render('login');
});
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
        // Session ID
        req.session.userId = user._id;
        console.log("Session User ID:", req.session.userId);

        // Update login timestamps
        user.lastLogin = user.currentLogin;
        user.currentLogin = Date.now(); 
        await user.save();

        res.send("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
// PASSWORD page
app.get("/forgot-password", (req, res) => {
    res.render("forgot-password")
})

// TEST for cookies
app.get("/cookies", (req, res) => {
    console.log(req.session);

    res.json({
        userId: req.session.userId,
        session: req.session
    });
});


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




// DASGBOARD PAGE-------------------------------------------------------------------------------------
// GET dashboard page
app.get("/dashboard", isLoggedIn, (req, res) => {
    res.render("dashboard", {user: req.user});
});

// PROFILE PAGE----------------------------------------------------------------------------------------
// GET profile
app.get("/profile", isLoggedIn, (req, res) => {
    res.render("profile", {user: req.user});
});
// Profile Picture uploading
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
// GET profile edit page
app.get('/profile-edit', isLoggedIn, function (req, res) {
    res.render('profile-edit', { user:req.user });
});
// POST profile edit page
app.post("/profile/edit", upload.single("profilepicture"), async (req, res) => {
    try {
        const { name, username, dob, phone, semester, branch } = req.body;
        const user = await userModel.findOne({ username });

        if (!user) return res.redirect("/login");
        Object.assign(user, {
            name, username,
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
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
});
// GET CHANGE-PASSWORD page
app.get("/change-password", isLoggedIn ,function (req, res) {
    res.render("change-password", { user: req.user });
})
// POST change-password
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





// SUPPORT PAGE-----------------------------------------------------------------------------------
app.get('/support', isLoggedIn, function (req, res) {
    res.render('support', { user:req.user });
});
// MULTER for support-page file upload
const supportStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/uploads/support");
    },
    filename:(req,file,cb)=>{
        const uniqueName=Date.now()+"-"+Math.round(Math.random()*1E9)+path.extname(file.originalname);
        cb(null,uniqueName);
    }
});

const supportUpload=multer({
    storage:supportStorage, limits:{files:5,fileSize:5*1024*1024},
    fileFilter:(req,file,cb)=>{
        if(file.mimetype.startsWith("image/")){
            cb(null,true);
        }else{
            cb(new Error("Only image files are allowed."));
        }
    }
});
// POST  support page
app.post("/support", isLoggedIn, supportUpload.array("attachments",5), async(req,res)=>{
        try{
            const lastTicket = await SupportModel.findOne().sort({ createdAt: -1 });
            let ticketId = "EDS-1001";
            if (lastTicket && lastTicket.ticketId) {
                const lastNumber = Number( lastTicket.ticketId.replace("EDS-", "") );
                if (!isNaN(lastNumber)) {
                    ticketId = `EDS-${lastNumber + 1}`;
                }
            }

            let priority="Low";
            if(
                req.body.category==="Subscription" ||
                req.body.category==="Payment"
            ){
                priority="High";
            }

            const attachments=req.files ? req.files.map(file=>"/uploads/support/"+file.filename) : [];

            await SupportModel.create({ user:req.user._id, ticketId, category:req.body.category, subject:req.body.subject, message:req.body.message, attachments, priority });

            res.render("support-success",{ user:req.user, ticketId});
        }
        catch(err){
            console.log(err);
            res.status(500).send("Something went wrong.");
        }
    }
);

// GET my-tickets page--------------------------------------------
app.get("/my-tickets", isLoggedIn, async (req, res) => {
    const tickets = await SupportModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.render("my-tickets", {user: req.user,tickets});
});
// DELETE ticket if status is Pending
app.delete("/ticket/:id", isLoggedIn, async (req, res) => {
    try {
        const ticket = await SupportModel.findById(req.params.id);
        if (!ticket) {
            return res.status(404).send("Ticket not found.");
        }
        // User can delete only their own ticket
        if (!ticket.user.equals(req.user._id)) {
            return res.status(403).send("Unauthorized.");
        }
        // Only Pending tickets can be deleted
        if (ticket.status !== "Pending") {
            return res.status(403).send("This ticket can no longer be deleted.");
        }
        // Delete uploaded screenshots
        if (ticket.attachments && ticket.attachments.length > 0) {
            const fs = require("fs");
            ticket.attachments.forEach(file => {
                const filePath = path.join(__dirname, "public", file);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        await SupportModel.findByIdAndDelete(ticket._id);
        res.redirect("/my-tickets");
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong.");
    }
});




// BRANCH PAGES-------------------------------------------------------------------------------------
app.get('/edushelf/:branch', isLoggedIn, (req, res) => {
    const branch = req.params.branch;
    res.render('semester', { branch, user:req.user });
});



// GET subject page-----------------------------------------------------------------------------
app.get('/edushelf/:branch/sem/:sem', isLoggedIn, (req, res) => {
    const { username, branch, sem } = req.params;
    const subjects = subjectsData[branch]?.[sem] || [];
    res.render("subjects", { user:req.user, branch, sem, subjects });
});



// GET Resources page-----------------------------------------------------------------------------
app.get('/edushelf/:branch/:sem/:subject', isLoggedIn, (req, res) => {
    const { branch, sem, subject } = req.params;
    const subjectPath = path.join( __dirname, "public", "resources", branch, `sem${sem}`, subject );

    fs.readdir(subjectPath, { withFileTypes: true }, (err, items) => {
        if (err) {
            console.log(err);
            return res.send("Subject folder not found.");
        }
        const resources = items.filter(item => item.isDirectory()).map(item => ({name: item.name}));
        res.render("resources", { user:req.user, branch, sem, subject, resources });
    });
});


// GET Resource-list page-----------------------------------------------------------------------------
app.get("/edushelf/:branch/:sem/:subject/:type", isLoggedIn, (req, res) => {
    const { username, branch, sem, subject, type } = req.params;
    const extraPath = req.query.folder ? decodeURIComponent(req.query.folder) : "";
    const folderPath = path.join(__dirname, "public", "resources", branch, `sem${sem}`, subject, type, extraPath);

    fs.readdir(folderPath,{withFileTypes:true},(err,items)=>{
        if(err){
            console.log(err);
            return res.send("Folder not found.");
        }
        const resources=items.map(item=>{
            let fileType="file";
            if(item.isDirectory()){
                fileType="folder";
            }else{
                const ext=path.extname(item.name).toLowerCase();
                if(ext===".pdf") fileType="pdf";
                else if([".png",".jpg",".jpeg",".webp",".gif"].includes(ext)) fileType="image";
                else if([".doc",".docx"].includes(ext)) fileType="word";
                else if([".ppt",".pptx"].includes(ext)) fileType="ppt";
                else if([".xls",".xlsx"].includes(ext)) fileType="excel";
                else if([".zip",".rar"].includes(ext)) fileType="zip";
            }
            return{name:item.name, type:fileType};
        });
        res.render("resource-list", {user:req.user, branch, sem, subject, type, resources, currentPath:extraPath});
    });
});


// GET PDF viewer page-----------------------------------------------------------------------------
app.get("/edushelf/:branch/:semester/:subject/:type/:file", isLoggedIn,(req,res)=>{
    const {branch,semester,subject,type,file}=req.params;
    const folder=req.query.folder||"";
    res.render("pdf-viewer",{username:req.user,branch,sem:semester,subject,type,file,folder});
});



// Logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send("Unable to logout");
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
});




// local host 3000 port------------------------------------------------------------------------------
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});




const syncResources = require("./utils/syncResources");

app.get("/admin/sync-resources", async (req, res) => {
    await syncResources();
    res.send("Resources Synced");
});
