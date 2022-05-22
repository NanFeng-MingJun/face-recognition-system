const AppError = require("../../utils/error");
const Classes = require("./../../models/class");

async function createClass(clss) {
    try {
        await Classes.create(clss);
    }
    catch(err) {
        if (err.code == 11000) {
            throw new AppError(409, "clss existed");
        }
        throw new AppError(500, "InternalError")
    }
}

async function getClassByID(id) {
    try {
        return await Classes.findById(id).exec();
    } 
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function getClassesByIDList(idList) {
    try {
        return await Classes.find({
            _id: { 
                $in: idList
            }
        }).exec(); 
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

async function addStudentByIDList(idList, studentID) {
    try {
        await Classes.updateMany({
            _id: { 
                $in: idList
            }
        }, 
        {
            $push: {
                students: studentID
            }
        }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

module.exports = {
    createClass,
    getClassByID,
    getClassContainStudent,
    getClassesByIDList,
    addStudentByIDList
}