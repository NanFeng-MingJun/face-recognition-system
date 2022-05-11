const Classes = require("./../../models/class");

async function getClassByID(id) {
    try {
        return await Classes.findById(id).exec();
    } 
    catch(err) {
        throw err
    }
}

module.exports = {
    getClassByID
}