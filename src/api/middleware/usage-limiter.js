const { read } = require("../../db");

const checkUploadLimit = async (req, res, next) => {
  const response = await read("status", "id", 1); // get the only row that contains usage
  const uploadLimit = parseInt(process.env.DAILY_FILE_UPLOAD_LIMIT || "0");
  if (response?.upload < uploadLimit) { // upload is less then the limit
    next();
  } else {
    return res.status(500).send({
      message: "Upload limit finished",
    });
  }
};

const checkDownloadLimit = async (req, res, next) => {
  const response = await read("status", "id", 1); // get the only row that contains usage
  const downloadLimit = parseInt(process.env.DAILY_FILE_DOWNLOAD_LIMIT || "0");
  if (response?.download < downloadLimit) { // download is less then the limit
    next();
  } else {
    return res.status(500).send({
      message: "Download limit finished",
    });
  }
};

module.exports = { checkUploadLimit, checkDownloadLimit };
