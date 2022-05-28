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

    try {
        const isMatchPass = await classUC.isMatchPassword(classID, password);

        if (!isMatchPass) {
            socket.emit("notify-join", { message: "Invalid classID or password", status: 401 });
            return;
        }

        socket.role = "host";
        socket.room = classID
        socket.join(classID);
        socket.emit("notify-join", { message: "success", status: 200 });
    }
    catch(err) {
        console.error(err);
        socket.emit("notify-join", { message: "Unexpected Error", status: 500 });
    }
}

// Capture member for host
async function captureMember(socket, io, data) {
	console.log(socket.role, socket.room);
    if (socket.role != "host") return;

    const roomSize = io.sockets.adapter.rooms.get(socket.room).size;
    console.log(roomSize);
    const checkinID = await checkinUC.createCheckin(socket.room, roomSize - 1); // except host
    socket.to(socket.room).emit("capture", { checkinID });
}

module.exports = {
    joinClassAsHost,
    joinClassAsMember,
    captureMember
}
