const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/siginupDB');

const userSchema = new mongoose.Schema({

    // initial fields
    userId: { type: Number, unique: true },
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,

    // extra fields
    profilepicture: { type: String, default: '/images/default-profile.png' },
    phonenumber: String,
    hostel: String,
    department: String,
    yearofstudy: Number,
    dob: Date,

    // profile status
    isProfileComplete: { type: Boolean, default: false }
});

module.exports = mongoose.model('user', userSchema);