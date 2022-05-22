const AppError = require("./../../utils/error");
const Students = require("./../../models/student");

async function createStudent(student) {
    try {
        await Students.create(student);
    }
    catch(err) {
        if (err.code == 11000) {
            throw new AppError(409, "Student existed");
        }
        throw new AppError(500, "InternalError")
    }
}

async function getStudentByID(studentID) {
    try {
        return await Students.findById(studentID);
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "InternalError")
    }
}

async function update(student) {
    try {
        await student.save();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "InternalError")
    }
} 

module.exports = { 
    createStudent,
    update,
    getStudentByID
}