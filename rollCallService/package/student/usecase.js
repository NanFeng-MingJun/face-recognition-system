const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const AppError = require("../../utils/error");
const studentRepo = require("./repository");
const classRepo = require("./../../package/class/repository");

async function studentRegister(payload) {
    const student = {
        _id: payload.id,
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
    }
    
    await studentRepo.createStudent(student);
}

async function getStudentByID(studentID) {
    const student = await studentRepo.getStudentByID(studentID);
    if (!student) {
        throw new AppError(404, "student not found");
    }
    
    return student;
}

async function getStudents() {
    return await studentRepo.getStudents();
}

async function updateImage(studentID, imageUrl) {
    const student = await studentRepo.getStudentByID(studentID);
    if (!student) {
        throw new AppError(404, "Student not found");
    }

	if (student.isImgUploaded) {
		throw new AppError(403, "Forbidden");
	}

    student.imageUrl = imageUrl;
    student.isImgUploaded = true;
    await studentRepo.update(student);
}

async function registerClasses(studentID, classIDs) {
    // check student existence
    const student = await studentRepo.getStudentByID(studentID);
    if (!student) {
        throw new AppError(404, "Student not found");
    }

    // register to face system
    const validClasses = await classRepo.getClassesByIDList(classIDs);
    const validIDs = validClasses.map(cls => cls._id);

    // console.log(validIDs);
    
    const postOption = {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${process.env.FACE_SYS_TOKEN}`
        },
        method: "POST",
        body: JSON.stringify({
            url: student.imageUrl,
            label: student._id,
            deparment: validIDs
        })
    };

    let postRes;
    try {
        postRes = await fetch(process.env.FACE_SYS_REGISTER, postOption);
    }
    catch(err) {
        console.error(`${process.env.FACE_SYS_REGISTER} is unavailable`);
        throw new AppError(503, "Service unavailable");
    }

    if (!postRes.ok) {
        console.error("Error to register to face system");
        throw new AppError(500, "Internal Server Error");
    }

    const postResult = await postRes.json();
    if (!postResult.result) {
        throw new AppError(403, "Need to update valid student image");
    } 

    // add student to classes
    await classRepo.addStudentByIDList(validIDs, studentID);
}

async function login(studentID, password) {
    const student = await studentRepo.getStudentByID(studentID);
    if (!student || student.password != password) {
        throw new AppError(401, "Invalid studentID or password");
    }

    const payload = {
        studentID: student._id,
        role: "student"
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });

    return token;
}

module.exports = { 
    getStudentByID,
    getStudents,
    studentRegister,
    updateImage,
    registerClasses,
    login
}
