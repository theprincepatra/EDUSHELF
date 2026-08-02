const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true},
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },

    fileName: { type: String, required: true }, 
    filePath: { type: String, required: true, unique: true }, 
    fileType: { type: String }, 
    fileSize: { type: Number }, 
    folderPath: {type: String, default: ""},

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("resource", resourceSchema);