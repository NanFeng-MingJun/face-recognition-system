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
    },

    at: {
        type: Date,
        required: true
    }
});

const checkinSchema = new mongoose.Schema({
    classID: {
        type: String,
        ref: "classes"
    },

    requestCount: {
        type: Number,
        required: true
    },

    isDone: {
        type: Boolean,
        default: false
    },

    attendances: {
        type: [attendanceSchema],
        default: []
    },

    endAt: {
        type: Date,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Checkin = mongoose.model("checkin", checkinSchema, "checkin")

module.exports = Checkin