const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
// const http = require("http").Server(app);

const port = process.env.PORT || 3000;

const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
// app.use(express.static("public"));

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
