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

    phone: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Students = mongoose.model("students", studentSchema, "students")

module.exports = Students