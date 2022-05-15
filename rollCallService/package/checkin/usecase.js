const fetch = require("node-fetch");
const AppError = require("../../utils/error");
const repo = require("./repository");
const classUC = require("./../class/usecase");

const maxCheckinTime = 2 * 60 * 1000; // ms

async function createCheckin(classID) {
    return repo.createCheckin(classID);
}

async function getCheckinByID(id) {
    return repo.getCheckinByID(id);
}

async function doCheckin(checkinID, imageUrl) {
    const currentTime = Date.now();
    const checkin = await repo.getCheckinByID(checkinID);
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
        metatdata: {
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
    const isStudentInClass = await classUC.isStudentExist(classID, studentID);
    if (!isStudentInClass) {
        console.log("Student is not in class")
        return;
    }

    await repo.addAttendance(checkinID, studentID);
}

module.exports = {
    createCheckin,
    getCheckinByID,
    doCheckin,
    addAttendance,
}