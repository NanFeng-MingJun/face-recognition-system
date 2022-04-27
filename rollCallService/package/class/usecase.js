const classes = [
    {
        classID: "cs123",
        password: "123"
    }
]

async function getClassByID(classID) {
    return classes.find(classItem => classItem.classID == classID);
}

module.exports = {
    getClassByID
}