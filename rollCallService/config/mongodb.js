const mongoose = require("mongoose");
const { createCheckin } = require("../package/checkin/repository");
const Students = require("./../models/student");

async function init() { 
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected");
    }
    catch(err) {
        console.error(err.code);
    }

    const ci = await createCheckin("cs123");
    console.log(ci.toString());
}

module.exports = { init }