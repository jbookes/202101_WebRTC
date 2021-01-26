const express = require("express");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`http://localhost:${port}`);
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
