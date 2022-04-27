const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const socketDelivery = require("./package/socket/delivery.js");
const imageDelivery = require("./package/image/delivery.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

socketDelivery.handleWebSocket(io);
app.use("/images", imageDelivery.router);


// health check
app.get("/healthcheck", (req, res) => {
    res.end("ok");
});

server.listen(3000);