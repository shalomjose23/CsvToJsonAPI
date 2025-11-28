const express = require("express");
const convertRoute = require("./routes/convert.route");

const app = express();
app.use(express.json());

app.use("/api", convertRoute);

module.exports = app;