const express = require("express");
const { body, validationResult } = require("express-validator");
const AppError = require("../../utils/error");

const uc = require("./usecase");
const router = express.Router();

router.post("/login",
    body(["username", "password"]).notEmpty().isString(),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError(422, "Invalid payload", errors.array()))
        }

        const role = req.query.role || "student";
        const { username, password } = req.body;

        try {
            const token = await uc.login(username, password, role);
            res.cookie("token", token, {
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "None",
                secure: true
            });
            res.status(200).json({ token });
        }
        catch(err) {
            return next(err);
        }
    }
)

router.get("/logout", async (req, res) => {
    res.clearCookie("token", {
        sameSite: "None",
        secure: true
    });
    res.status(200).json({ message: "Logged out" });
})

module.exports = { router }
