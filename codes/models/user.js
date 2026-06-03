const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/siginupDB');

const userSchema = new mongoose.Schema({

    // Initial fields
    userId: { type: Number, unique: true },
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // Profile fields
    profilepicture: {
        type: String,
        default: '/images/dashboard/default-profile.png'
    },
    phone: {
        type: String,
        default: ''
    },
    dob: {
        type: Date,
        default: null
    },
    branch: {
        type: String,
        default: ''
    },
    semester: {
        type: Number,
        default: null
    },

    // Profile status
    isProfileComplete: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('user', userSchema);