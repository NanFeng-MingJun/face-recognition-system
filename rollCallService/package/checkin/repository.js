const Checkin = require("./../../models/checkin");

async function createCheckin(classID) {
    const checkin = await Checkin.create({
        classID: classID
    });

    return checkin.toString();
}

module.exports = {
    createCheckin
}