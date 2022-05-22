const classUC = require("./../../package/class/usecase");
const studentUC = require("./../../package/student/usecase");

// return token
async function login(username, password, role) {
    switch(role) {
        case "student":
            return await studentUC.login(username, password);
        case "class":
            return await classUC.login(username, password);
    }
}

module.exports = {
    login
}