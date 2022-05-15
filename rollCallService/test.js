const dotenv = require("dotenv");
const checkin = require("./package/checkin/usecase");
const mongoConfig = require("./config/mongodb");

(async function() {
    // dotenv
    dotenv.config();

    // mongodb
    await mongoConfig.init();

    // checkin
    const id = await checkin.createCheckin("cs123");
    console.log(id);
    await checkin.doCheckin(id, "asdsad")
})()
