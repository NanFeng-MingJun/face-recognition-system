const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");
const uc = require("./usecase");

const router = express.Router();


// webhook for receive result
router.post("/webhook", 
    body(["ID", "metadata", "department"]).notEmpty(),
    body(["ID"]).isString(),
    body(["department"]).isString(),
    body(["metadata"]).isObject(),
    body(["metadata.checkinID"]).notEmpty().isString(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors);
            return next(new AppError(422, "Invalid format", errors));
        }

        console.log(req.body);

        const { checkinID } = req.body.metadata;
        const studentID = req.body.ID;
        const classID = req.body.department;

        try {
            await uc.addAttendance(checkinID, classID, studentID);
        }
        catch(err) {
            next(err);
        }

        res.status(200).json({ message: "ok" });
    }
);

router.post("/:checkinID", 
    body(["imageUrl"]).notEmpty().isURL({ require_tld: false }), 

    async (req, res, next) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid format", errors));
        }

        try {
            const checkinID = req.params.checkinID;
            const imageUrl = req.body.imageUrl;
            await uc.doCheckin(checkinID, imageUrl);
        }
        catch(err) {
            return next(err);
        }

        res.status(200).json({ message: "ok" });
    }
);


module.exports = { router } 
