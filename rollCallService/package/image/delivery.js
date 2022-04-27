const express = require("express");
const imageUC = require("./usecase.js");
const router = express.Router();

router.post("/", (req, res) => {
    imageUC.uploadImage(req.body.imageName);
    res.json({ message: "success" });
});

router.get("/", async (req, res) => {
    const payload = await imageUC.getPresignedUrl();
    res.json(payload);
})

module.exports = {
    router
}
