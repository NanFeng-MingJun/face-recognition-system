const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const checkin = require("./package/checkin/usecase");
const student = require("./package/student/repository");
const mongoConfig = require("./config/mongodb");
const minioClient = require("./config/minio.js");

(async function() {
    // dotenv
    
   // console.log(jwt.verify("asdsadasd", "asdasd"));
    // mongodb
    await mongoConfig.init();

    // checkin
    const id = await checkin.createCheckin("cs101");
    console.log(id, typeof id);
    // await checkin.doCheckin(id, "asdsad")
    // await student.updateImage("asdasd", "sadasd");

    //try {
   //     console.log(await minioClient.presignedPutObject("face", "cac", 123213));
    //} catch(err) {
    //    console.log(err);
//}
})()
