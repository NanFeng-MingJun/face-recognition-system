const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");

const uc = require("./usecase");

const router = express.Router();

// register new student
router.post("/", 
    body(["id", "name", "phone"]).notEmpty().isString(),

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

module.exports = { router };