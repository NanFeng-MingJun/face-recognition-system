const fetch = require("node-fetch");
const AppError = require("../../utils/error");
const checkinRepo = require("./repository");
const classRepo = require("./../class/repository");

const maxCheckinTime = 2 * 60 * 1000; // ms

async function createCheckin(classID) {
    return checkinRepo.createCheckin(classID);
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

async function doCheckin(checkinID, imageUrl) {
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
            checkinID: checkinID
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
        throw new AppError(503, "Service unavailable");
    }

    if (!sendRes.ok) {
        console.error("Error to create face recognition ticket");
        throw new AppError(500, "Internal Server Error");
    }
}

async function addAttendance(checkinID, classID, studentID) {
    const student = await classRepo.getClassContainStudent(classID, studentID);
    if (!student) {
        console.log("Student is not in class")
        return;
    }

    await checkinRepo.addAttendance(checkinID, studentID);
}

module.exports = {
    createCheckin,
    getClassCheckinByID,
    getCheckinsByClassID,
    doCheckin,
    addAttendance,
}
