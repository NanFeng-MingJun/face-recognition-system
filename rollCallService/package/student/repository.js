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

module.exports = { 
    createStudent 
}