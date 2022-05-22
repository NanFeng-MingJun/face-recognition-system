const Minio = require("minio");

let minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST || 'localhost',
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_USER || 'minioadmin',
    secretKey: process.env.MINIO_PASS || 'minioadmin'
});

module.exports = minioClient;
