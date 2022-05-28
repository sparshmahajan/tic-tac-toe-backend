const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const randomize = require('randomatic');



io.on("connection", (socket) => {
    console.log("User Connected");

    socket.on('createRoom', () => {
        const random = randomize('A0', 5);
        socket.join(random);
        socket.emit('firstPlayerJoin', random);
    })

    socket.on("joinRoom", (roomCode) => {
        const connectedSockets = io.sockets.adapter.rooms.get(roomCode);

        if (!connectedSockets || connectedSockets.size === 0) {
            return socket.emit('error', "Enter Valid Code");
        }
        else if (connectedSockets && connectedSockets.size === 2) {
            return socket.emit('error', "Room is full");
        }
        socket.join(roomCode);
        console.log(`User Joined at ${roomCode}`);
        io.to(roomCode).emit('secondPlayerJoin');
    });

    socket.on("play", ({ id, roomCode, ch }) => {
        console.log(`play ${ch} at ${id} to ${roomCode}`);
        socket.broadcast.to(roomCode).emit("updateGame", id, ch);
    });

    socket.on('newGame', (roomCode) => {
        socket.broadcast.to(roomCode).emit('newGame');
    });

    socket.on('secondPlayerNewGame', (roomCode) => {
        socket.broadcast.to(roomCode).emit('secondPlayerNewGame');
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});