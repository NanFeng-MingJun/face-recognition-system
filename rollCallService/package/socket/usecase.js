const checkinUC = require("../checkin/repository.js");
const classUC = require("./../class/usecase.js");

// Join class event for member
async function joinClassAsMember(socket, data) {
    const classID = data.classID;
    const classRoom = await classUC.getClassByID(classID);

    if (!classRoom) {
        socket.emit("notify-join", { message: "class not found", status: 404 });
        return;
    }

    socket.role = "member";
    socket.join(classID);
    socket.emit("notify-join", { message: "success", status: 200 });
}

// Join class event for host
async function joinClassAsHost(socket, data) {
    const { classID, password } = data;
    const classRoom = await classUC.getClassByID(classID);

    if (!classRoom || classRoom.password != password) {
        socket.emit("notify-join", { message: "class not found", status: 404 });
        return;
    }

    socket.role = "host";
    socket.room = classID
    socket.join(classID);
    socket.emit("notify-join", { message: "success", status: 200 });
}

// Capture member for host
function captureMember(socket, data) {
	console.log(socket.role, socket.room);
    if (socket.role != "host") return;

    const checkinID = checkinUC.createCheckin(socket.room);
    socket.to(socket.room).emit("capture", { checkinID });
}

module.exports = {
    joinClassAsHost,
    joinClassAsMember,
    captureMember
}
