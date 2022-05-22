const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");

const uc = require("./usecase");

const router = express.Router();

// create new student
router.post("/", 
    body(["id", "name", "phone", "password"]).notEmpty().isString(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid payload", errors.array()))
        }

        const payload = req.body;
        try {
            await uc.studentRegister(payload);
        } 
        catch(err) {
            return next(err);
        }

        res.status(201).json({ "message": "created" });
    }
);

// register student to classes
router.post("/classes/register", 
    body(["studentID"]).notEmpty().isString(),
    body(["classIDs"]).notEmpty().isArray(),
    
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid payload", errors.array()))
        }

        const { studentID, classIDs } = req.body;
        try {
            await uc.registerClasses(studentID, classIDs);
        }
        catch(err) {
            return next(err);
        }

        res.json(200, { "message": "ok" });
    }
);


// get info
router.get("/info", async (req, res, next) => {
    const studentID = req.user.studentID;
    try {
        const student = await uc.getStudentByID(studentID);
        student.password = undefined;
        // student.isImgUploaded = undefined;
        res.status(200).json({ data: student });
    }
    catch(err) {
        return next(err);
    }
});

// update student image
router.post("/image", 
    body(["imageUrl"]).notEmpty().isURL(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid payload", errors.array()))
        }

        const studentID = req.user.studentID;
        const imageUrl = req.body.imageUrl;
        try {
            await uc.updateImage(studentID, imageUrl);
        }
        catch(err) {
            return next(err);
        }

        res.status(200).json({ "message": "updated" });
    }
)

module.exports = { router };
