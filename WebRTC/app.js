const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const http = require("http").Server(app);
const httpolyglot = require("httpolyglot");

const options = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "key.pem"), "utf-8"),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "cert.pem"), "utf-8"),
};

const httpsServer = httpolyglot.createServer(options, app);
const io = require("socket.io")(httpsServer);

const port = process.env.PORT || 19082;

app.use(express.static("public"));

httpsServer.listen(port, () => {
  console.log(`https://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("create or join", (room) => {
    // 화상채팅방이 있다면 들어가고 없다면 생성
    console.log("create or join room", room);
    room = room.trim();
    const myRoom = io.sockets.adapter.rooms.get(room) || { size: 0 };
    const numClients = myRoom.size;
    console.log(room, "has", numClients, "clients");

    if (numClients === 0) {
      socket.join(room);
      socket.emit(`created`, room); // 방의 생성코드번호 전송
    } else if (numClients === 1) {
      socket.join(room);
      socket.emit(`joined`, room);
    } else {
      // 2명 이상이 들어온다면 못오도록 막음
      socket.emit(`full`, room);
    }
  });

  socket.on("ready", (room) => {
    socket.broadcast.to(room).emit("ready");
  });

  socket.on("candidate", (event) => {
    socket.broadcast.to(event.room).emit("candidate", event);
  });

  socket.on("offer", (event) => {
    socket.broadcast.to(event.room).emit("offer", event.sdp);
  });

  socket.on("answer", (event) => {
    socket.broadcast.to(event.room).emit("answer", event.sdp);
  });
});
