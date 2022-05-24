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

async function getCheckinsByClassID(classID) {
    try {
        return await Checkin.find({ classID }, { createdAt: 1 }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function addAttendance(checkinID, attendance) {
    try {
        await Checkin.updateOne({ _id: checkinID }, {
            $push: { attendances: attendance }
        }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

module.exports = {
    createCheckin,
    getCheckinsByClassID,
    getCheckinByID,
    addAttendance
}