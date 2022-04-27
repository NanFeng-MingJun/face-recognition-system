const minioClient = require("./../../config/minio.js");
const uuid = require("uuid").v4;

function uploadImage(imageName) {
    console.log(imageName);
}

async function getPresignedUrl() {
    const name = uuid() + ".png";
    const url = await minioClient.presignedPutObject("face", name);
    return { name, url};
}

module.exports = {
    uploadImage,
    getPresignedUrl
}
