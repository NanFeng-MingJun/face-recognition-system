const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");
const uc = require("./usecase");

const router = express.Router();

// create offline checkin
router.post("/", 
    body("waitTimeout").isInt({ min: 0 }),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid format", errors));
        }

        const { waitTimeout } = req.body;
        const classID = req.user.classID;
        const checkinID = await uc.createOfflineCheckin(classID, waitTimeout);

        res.json({ checkinID });
    }
);

// webhook for receive result
router.post("/webhook", 
    body(["ID", "metadata", "department"]).notEmpty(),
    body(["ID"]).isString(),
    body(["department"]).isString(),
    body(["metadata"]).isObject(),
    body(["metadata.checkinID"]).notEmpty().isString(),
    body(["metadata.checkinImg"]).isString(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error(errors);
            return next(new AppError(422, "Invalid format", errors));
        }

        console.log(req.body);

        const { checkinID } = req.body.metadata;
        const classID = req.body.department;
        const attendance = {
            studentID: req.body.ID,
            checkinImg: req.body.metadata.checkinImg
        }

        try {
            await uc.addAttendance(checkinID, classID, attendance);
        }
        catch(err) {
            next(err);
        }

        res.status(200).json({ message: "ok" });
    }
);

router.post("/offline",
    body(["emb"]).notEmpty().isArray({ require_tld: false }), 
    body(["department"]).notEmpty().isString(),
    body(["secret"]).notEmpty().isString(),

    async (req, res, next) => {
        // validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid format", errors));
        }

        try {
            const emb = req.body.emb;
            const classID = req.body.department;
            const password = req.body.secret;
            await uc.doOfflineCheckin(classID, password, emb);
        }
        catch(err) {
            return next(err);
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
            await uc.doOnlineCheckin(checkinID, imageUrl);
        }
        catch(err) {
            return next(err);
        }

        res.status(200).json({ message: "ok" });
    }
);

router.get("/", async (req, res, next) => {
    const classID = req.user.classID;
    try {
        const list = await uc.getCheckinsByClassID(classID);
        res.status(200).json({ list });
    }
    catch(err) {
        return next(err);
    }
});

router.get("/:checkinID", async (req, res, next) => {
    const classID = req.user.classID;
    const checkinID = req.params.checkinID;
    try {
        const checkin = await uc.getClassCheckinByID(checkinID, classID);
        res.status(200).json({ data: checkin });
    }
    catch(err) {
        return next(err);
    }
});


module.exports = { router } 
