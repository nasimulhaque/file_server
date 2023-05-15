const express = require("express");
const fileRouter = express.Router();
const fileController = require("../controller/file.controller");
const { checkUploadLimit, checkDownloadLimit } = require("../middleware/usage-limiter");
const fileHandler = require('../middleware/file-handler');

fileRouter.get("/:publicKey", checkDownloadLimit, fileController.get);
fileRouter.post("/", fileHandler, checkUploadLimit, fileController.upload);
fileRouter.delete("/:privateKey", fileController.remove);

module.exports = fileRouter;