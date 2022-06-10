const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const mongoConfig = require("./config/mongodb");

// dotenv
if (process.env.NODE_ENV == "production") {
    dotenv.config({ path: ".env.prod" });
} else {
    dotenv.config({ path: ".env" });
}

// mongodb
mongoConfig.init();

// app
const accessControl = require("./middleware/access-control.js");
const socketDelivery = require("./package/socket/delivery.js");
const imageDelivery = require("./package/image/delivery.js");
const studentDelivery = require("./package/student/delivery.js");
const checkinDelivery = require("./package/checkin/delivery.js");
const classDelivery = require("./package/class/delivery.js");
const authDelivery = require("./package/auth/delivery.js");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(accessControl());

socketDelivery.handleWebSocket(io);
app.use("/images", imageDelivery.router);
app.use("/students", studentDelivery.router);
app.use("/checkin", checkinDelivery.router);
app.use("/classes", classDelivery.router);
app.use("/auth", authDelivery.router);


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

server.listen(3005);
