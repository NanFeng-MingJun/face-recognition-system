const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");

const uc = require("./usecase");

const router = express.Router();

// create new class
router.post("/", 
    body(["id", "password"]).notEmpty().isString(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid payload", errors.array()))
        }

        const payload = req.body;
        try {
            await uc.createClass(payload);
            res.status(201).json({ "message": "created" });
        } 
        catch(err) {
            return next(err);
        }
    }
);

// Get class info
router.get("/info", async (req, res, next) => {
    try {
        const classID = req.user.classID;
        const data = await uc.getClassByID(classID);

        data.password = undefined;
        res.status(200).json({ data });
    }
    catch(err) {
        return next(err);
    }
});

module.exports = { router }