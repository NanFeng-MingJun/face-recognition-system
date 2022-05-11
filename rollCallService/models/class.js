const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },

    // password for class host
    password: {
        type: String,
        required: true
    },

    students: {
        type: [String],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Classes = mongoose.model("classes", classSchema, "classes")

module.exports = Classes