const express = require("express");
const router = express.Router();
const { convertCSV } = require("../controllers/convert.controller");

router.get("/convert", convertCSV);

module.exports = router;