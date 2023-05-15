const fs = require("fs");
const util = require('util');
const { rimraf } = require("rimraf");

const rootFolder = `${__dirname}/../../buckets/${process.env.FOLDER}`; // local directory where files will be stored

// create root folder if it doesn't exist
const createDirectory = async () => {
  if (!fs.existsSync(rootFolder)) {
    fs.mkdirSync(rootFolder, { recursive: true });
  }
};

// get file from storage in response
const getFile = async (res, path) => {
  return fs.createReadStream(path).pipe(res);
};

const uploadFile = async (req, res) => {
  const filePath = `${rootFolder}/${req.file.filename}`; // path to write the file
  await fs.promises.writeFile(filePath, req.file.buffer);
  return filePath; // return the file path to store in database
};

const deleteFile = async (file) => {
  const filePath = file.location; // location of the file to delete
  return await rimraf(filePath);
};

module.exports = { createDirectory, getFile, uploadFile, deleteFile };
