const express = require("express");

const app = express();

app.get("/", (request, response) => {
  response.send("App is started");
});

app.listen(3000, () => {
  console.log("app started listening at http://localhost:3000");
});
