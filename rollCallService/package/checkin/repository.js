const Checkin = require("./../../models/checkin");

async function createCheckin(classID, requestCount, waitTimeout, mode) {
    const createdAt = Date.now();

    const checkin = await Checkin.create({
        classID: classID,
        requestCount: requestCount,
        mode: mode,
        endAt: createdAt + waitTimeout,
        createdAt: createdAt,
    });

    console.log(checkin);

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
        return await Checkin.find({ classID }, { createdAt: 1, mode: 1 }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function getLatestOffileCheckin(classID) {
    try {
        return await Checkin.findOne({ 
            classID, 
            mode: "offline",
        }).sort({ createdAt: -1 }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function addAttendance(checkinID, attendance) {
    try {
        const updateResult = await Checkin.updateOne({ _id: checkinID }, {
            $push: { attendances: attendance }
        }).exec();

        return updateResult.modifiedCount;
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function updateRequestCount(checkinID, amount) {
    try {
        await Checkin.updateOne({ 
            _id: checkinID,
            requestCount: {
                $gt: 0
            }
        }, {
            $inc: { 
                "requestCount": amount 
            }
        }).exec();
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server Error");
    }
}

async function checkAndUpdateEndtime(checkinID, dateNow) {
    try {
        await Checkin.updateOne({ 
            _id: checkinID,
            requestCount: 0,
            endAt: { $gte: dateNow }
        }, {
            endAt: dateNow
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
    getLatestOffileCheckin,
    addAttendance,
    updateRequestCount,
    checkAndUpdateEndtime
}
