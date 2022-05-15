const repo = require("./repository");

async function getClassByID(classID) {
    return repo.getClassByID(classID);
}

async function isStudentExist(classID, studentID) {
    if (await repo.getClassContainStudent(classID, studentID)) {
        return true;
    }
    return false;
}

module.exports = {
    getClassByID,
    isStudentExist,
}