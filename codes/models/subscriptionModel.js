const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    planName: { type: String, enum: ["Weekly", "Monthly", "Semester", "Yearly"], required: true },

    amount: { type: Number, required: true },
    paymentId: { type: String, default: null },
    transactionId: { type: String, default: null },
    paymentMethod: { type: String, default: null },// UPI / card / netbanking
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },

    subscriptionStatus: { type: String, enum: ["Active", "Expired", "Cancelled"], default: "Active" },

    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true }, 
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("subscription", subscriptionSchema);