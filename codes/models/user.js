const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/siginupDB');

const userSchema = new mongoose.Schema({

    // Initial fields
    userId: { type: Number, unique: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    joinedon: { type: Date, default: Date.now() },
    referralCode: { type: String, default: '' },

    // Profile fields
    profilepicture: {type: String,default: '/images/dashboard/default-profile.png'},
    phone: {type: String,default: null },
    dob: {type: Date,default: null },
    branch: {type: String,default: null },
    semester: {type: Number,default: null },
    currentLogin: {type: Date,default: Date.now() },
    lastLogin: {type: Date,default: null },
    phoneVerified: {type: String,default: "Not Verified" },

    // Profile status
    isProfileComplete: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('user', userSchema);