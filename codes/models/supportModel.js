const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
    name: String,
    email: String,
    category: String,
    subject: String,
    message: String,
    status: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Support", supportSchema);