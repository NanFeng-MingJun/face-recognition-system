const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    
    name: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
        default: ""
    },

    isImgUploaded: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Students = mongoose.model("students", studentSchema, "students")

module.exports = Students