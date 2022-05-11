const repo = require("./repository");

async function studentRegister(payload) {
    const student = {
        _id: payload.id,
        name: payload.name,
        phone: payload.name
    }
    
    await repo.createStudent(student);
}

module.exports = { studentRegister }