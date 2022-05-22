const minioClient = require("./../../config/minio.js");
const AppError = require("./../../utils/error");
const uuid = require("uuid").v4;

function uploadImage(imageName) {
    console.log(imageName);
}

async function getPresignedUrl() {
    const name = uuid() + ".png";
    const putExpiry = 2 * 60; // 2s
    const getExpiry = 365 * 24 * 60 * 60; // 1y
    let putUrl, getUrl;
    
    try {
        putUrl = await minioClient.presignedPutObject("face", name, putExpiry);
        getUrl = "http://localhost:9000/face/" + name;
    }
    catch(err) {
        console.error(err);
        throw new AppError(500, "Internal Server");
    }

    return { name, putUrl, getUrl };
}

module.exports = {
    uploadImage,
    getPresignedUrl
}
