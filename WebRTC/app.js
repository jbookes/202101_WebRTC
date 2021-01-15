const express = require("express");
const app = express;
const http = require("http").Server(app);

const port = process.env.PORT || 3000;
app.request(express.static("public"));

http.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
