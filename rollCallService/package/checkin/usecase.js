const fetch = require("node-fetch");
const AppError = require("../../utils/error");
const checkinRepo = require("./repository");
const classRepo = require("./../class/repository");

const maxCheckinTime = 2 * 60 * 1000; // ms

// mode = online / offline
async function createOnlineCheckin(classID, requestCount) {
    const waitTimeout = 30 * 60 * 1000;
    return checkinRepo.createCheckin(classID, requestCount, waitTimeout, "online");
}

async function createOfflineCheckin(classID, waitTimeout) {
    return checkinRepo.createCheckin(classID, -1, waitTimeout, "offline");
}

async function getClassCheckinByID(id, classID) {
    const checkin = await checkinRepo.getCheckinByID(id);
    if (!checkin || checkin.classID != classID) {
        throw new AppError(404, "checkin not found");
    }

    return checkin;
}

async function getCheckinsByClassID(classID) {
    return checkinRepo.getCheckinsByClassID(classID);
}

async function doOnlineCheckin(checkinID, imageUrl) {
    const currentTime = Date.now();
    const checkin = await checkinRepo.getCheckinByID(checkinID);
    // check checkin existence and checkin deadline

    if (!checkin || currentTime - checkin.createdAt > maxCheckinTime) {
        throw new AppError(403, "Checkin Forbidden");
    } 

    // create face reognition ticket
    const face_sys_token = process.env.FACE_SYS_TOKEN;
    const face_sys_endpoint = process.env.FACE_SYS_ENDPOINT;

    const data = {
        imageUrl: imageUrl,
        department: checkin.classID,
        metadata: {
            checkinID: checkinID,
            checkinImg: imageUrl
        }
    };

    const sendOptions = {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${face_sys_token}`
        },
        body: JSON.stringify(data),
        method: "POST",
    };
    
    let sendRes = null;
    try {
        sendRes = await fetch(face_sys_endpoint, sendOptions);
    }
    catch(err) {
        console.error(`${face_sys_endpoint} is unavailable`);
        await checkinRepo.updateRequestCount(checkinID, -1); // rollback count
        throw new AppError(503, "Service unavailable");
    }

    if (!sendRes.ok) {
        console.error("Error to create face recognition ticket");
        await checkinRepo.updateRequestCount(checkinID, -1); // rollback count
        throw new AppError(500, "Internal Server Error");
    }
}

async function doOfflineCheckin(classID, password, emb) {
    const currentTime = Date.now();
    const cls = await classRepo.getClassByID(classID);
    if (!cls || password != cls.password) {
        return;
    }

    const checkin = await checkinRepo.getLatestOffileCheckin(classID);

    // check checkin existence and checkin deadline
    if (!checkin || currentTime > checkin.endAt) {
        throw new AppError(403, "Checkin Forbidden");
    } 

    // create face reognition ticket
    const face_sys_token = process.env.FACE_SYS_TOKEN;
    const face_sys_endpoint = process.env.FACE_SYS_ENDPOINT;

    const data = {
        embedding: emb,
        department: classID,
        metadata: {
            checkinID: checkin._id,
            checkinImg: ""
        }
    };

    const sendOptions = {
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${face_sys_token}`
        },
        body: JSON.stringify(data),
        method: "POST",
    };
    
    let sendRes = null;
    try {
        sendRes = await fetch(face_sys_endpoint + "?platform=embed", sendOptions);
    }
    catch(err) {
        console.error(`${face_sys_endpoint} is unavailable`);
        throw new AppError(503, "Service unavailable");
    }

    if (!sendRes.ok) {
        console.error("Error to create face recognition ticket");
        throw new AppError(500, "Internal Server Error");
    }
}

async function addAttendance(checkinID, classID, attendance) {
    const cls = await classRepo.getClassContainStudent(classID, attendance.studentID);
    if (!cls) {
        console.log("Student is not in class");
        attendance.studentID = "unknown";
    }

    attendance.at = Date.now();

    const updatedCount = await checkinRepo.addAttendance(checkinID, attendance);
    if (!updatedCount) {
        return;
    }

    await checkinRepo.updateRequestCount(checkinID, -1);
    await checkinRepo.checkAndUpdateEndtime(checkinID, Date.now());
}

module.exports = {
    createOnlineCheckin,
    createOfflineCheckin,
    getClassCheckinByID,
    getCheckinsByClassID,
    doOnlineCheckin,
    doOfflineCheckin,
    addAttendance,
}
