const express = require("express");
const router = express.Router();
const fileRouter = require("./file.route");

router.use("/files", fileRouter); // router for file get, post, delete operations

module.exports = router;