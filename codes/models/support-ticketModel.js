const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema({

    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    ticketId: { type:String, unique: true }, 
    category: { type:String, required: true, enum: ["General", "Account", "Subscription", "Resources", "Technical", "Payment", "Bug Report", "Feature Request", "Other"]}, 

    subject: { type:String, required: true, trim: true }, 
    message: { type:String, required: true, trim: true }, 
    attachments: { type: [String], default: [] },

    priority: { type:String, enum: ["Low", "High"], default: "Low" }, 
    status: { type:String, enum: [ "Pending", "In Progress", "Resolved"], default: "Pending" }, 

    adminReply: { type:String, default: "" }, 
    repliedAt: { type:Date, default: null }, 
    createdAt: { type:Date, default: Date.now } 
});

supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ user: 1 });

module.exports = mongoose.model("supportTicket", supportTicketSchema);