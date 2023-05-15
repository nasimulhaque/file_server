const multer = require("multer");
const uuid = require("uuid");
const utils = require("../../utils");

// middleware to handle multipart form data and attache req.file object
const fileHandler = async (req, res, next) => {
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: parseInt(process.env.MAX_UPLOAD_FILE_SIZE) },
  }).single("file")(req, res, function (error) {
    if (error instanceof multer.MulterError) {
      if (error.code == "LIMIT_FILE_SIZE") { // error occured when the file size exceeds the limit
        return res.status(500).send({
          message: `File larger than ${utils.formatBytes(
            process.env.MAX_UPLOAD_FILE_SIZE,
            2
          )} cannot be uploaded!`,
        });
      }
    } else if (error) {
      res.status(500).send({
        message: `Unable to upload the file. ${error}`,
      });
    }
    req.file = {
      filename: `${uuid.v4()}-${req.file.originalname.replace(/ /g, "-")}`,
      ...req.file,
    };
    next();
  });
};

module.exports = fileHandler;
