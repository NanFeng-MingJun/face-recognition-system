const jwt = require("jsonwebtoken");
const AppError = require("../../utils/error");
const repo = require("./repository");

async function createClass(payload) {
    const clss = {
        _id: payload.id,
        password: payload.password,
    }
    
    await repo.createClass(clss);
}

async function getClassByID(classID) {
    return repo.getClassByID(classID);
}

async function isMatchPassword(classID, password) {
    const clss = await repo.getClassByID(classID);
    if (!clss) return false;
    return clss.password == password; 
}

async function login(classID, password) {
    const clss = await repo.getClassByID(classID);
    if (!clss || clss.password != password) {
        throw new AppError(401, "Invalid classID or password");
    }

    const payload = {
        classID: clss._id,
        role: "class"
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    return token;
}

module.exports = {
    createClass,
    getClassByID,
    isMatchPassword,
    login
}