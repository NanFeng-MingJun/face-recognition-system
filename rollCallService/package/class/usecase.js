const repo = require("./repository");

async function getClassByID(classID) {
    return repo.getClassByID(classID);
}

module.exports = {
    getClassByID
}