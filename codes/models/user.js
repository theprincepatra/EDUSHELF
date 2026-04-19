const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/siginupDB');

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
});

module.exports = mongoose.model('user', userSchema);