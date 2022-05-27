const socketUC = require("./usecase.js");

function handleWebSocket(io) {
    io.on("connection", socket => {
        socket.on("join-member", socketUC.joinClassAsMember.bind(null, socket));
        socket.on("join-host", socketUC.joinClassAsHost.bind(null, socket));
        socket.on("capture-member", socketUC.captureMember.bind(null, socket, io))
    });
}

module.exports = {
    handleWebSocket
}