const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema({
    classID: {
        type: String,
        ref: "classes"
    },

    attendances: {
        type: [String],
        default: []
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Checkin = mongoose.model("checkin", checkinSchema, "checkin")

module.exports = Checkin