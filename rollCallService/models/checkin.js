const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentID: {
        type: String,
        required: true,
        ref: "students"
    },

    checkinImg: {
        type: String,
        required: true
    }
});

const checkinSchema = new mongoose.Schema({
    classID: {
        type: String,
        ref: "classes"
    },

    attendances: {
        type: [attendanceSchema],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Checkin = mongoose.model("checkin", checkinSchema, "checkin")

module.exports = Checkin