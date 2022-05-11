const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");

const mongoConfig = require("./config/mongodb");

// dotenv
dotenv.config();

// mongodb
mongoConfig.init();

// app
const socketDelivery = require("./package/socket/delivery.js");
const imageDelivery = require("./package/image/delivery.js");
const studentDelivery = require("./package/student/delivery.js");

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
app.use("/students", studentDelivery.router);


// health check
app.get("/healthcheck", (req, res) => {
    res.end("ok");
});


// error handler
app.use((err, req, res, next) => {
    const code = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const detail = err.detail || null;
    
    if (code == 500) {
        console.error(err);
    }

    res.status(code).json({ error: message, detail: detail });
});

server.listen(3000);