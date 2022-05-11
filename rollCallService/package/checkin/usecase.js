const repo = require("./repository");

async function createCheckin(classID) {
    return repo.createCheckin(classID);
}

module.exports = {
    createCheckin
}