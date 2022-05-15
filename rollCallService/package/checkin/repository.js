const Checkin = require("./../../models/checkin");

async function createCheckin(classID) {
    const checkin = await Checkin.create({
        classID: classID
    });

    return checkin._id.toString();
}

async function getCheckinByID(id) {
    try {
        const checkin = await Checkin.findById(id).exec();
        return checkin;
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function addAttendance(checkinID, studentID) {
    try {
        await Checkin.updateOne({ _id: checkinID }, {
            $push: { attendances: studentID }
        }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

module.exports = {
    createCheckin,
    getCheckinByID,
    addAttendance
}