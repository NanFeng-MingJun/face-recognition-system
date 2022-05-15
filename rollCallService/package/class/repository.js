const AppError = require("../../utils/error");
const Classes = require("./../../models/class");

async function getClassByID(id) {
    try {
        return await Classes.findById(id).exec();
    } 
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function getClassContainStudent(classID, studentID) {
    try {
        return await Classes.findOne({ 
            _id: classID,
            students: studentID 
        }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

module.exports = {
    getClassByID,
    getClassContainStudent
}