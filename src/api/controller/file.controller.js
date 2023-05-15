const storage = require("../../storage");
const db = require("../../db");
const utils = require("../../utils");
const provider = process.env.PROVIDER || 'local';

const get = async (req, res) => {
  try {
    const { publicKey } = req.params; // get public key from request parameter
    const response = await db.read("upload", "publicKey", publicKey); // get file info from database matching public key
    // update usage data
    await db.update(
      {
        downloadedAt: Date.now(),
      },
      "upload",
      "publicKey",
      publicKey
    );
    // update usage data
    await db.update(
      {
        download: "download + 1",
      },
      "status",
      "id",
      1
    );
    // set header for file type
    res.setHeader("content-type", response.mimeType);
    return storage.getFile(res, response.location);
  } catch (error) {
    return res.status(500).send({
      message: "Invalid key!",
    });
  }
};

const upload = async (req, res) => {
  try {
    if (req.file == undefined) { // file not found from the request
      return res.status(400).send({ message: "Upload a file please!" });
    }
    const location = await storage.uploadFile(req, res); // get file storage location where it is uploaded
    const { filename, mimetype } = req.file;
    const { publicKey, privateKey } = utils.generateKeys(filename); // generate public and private keys for the file
    // add file info to database
    await db.create(
      {
        name: filename,
        mimeType: mimetype,
        location: location,
        provider: provider,
        publicKey: publicKey,
        privateKey: privateKey,
        uploadedAt: Date.now(),
        downloadedAt: Date.now(),
      },
      "upload"
    );
    // update usage data
    await db.update(
      {
        upload: "upload + 1",
      },
      "status",
      "id",
      1
    );
    return res.status(500).send({
      message: { publicKey, privateKey },
    });
  } catch (error) {
    res.status(500).send({
      message: `Unable to upload the file. ${error}`,
    });
  }
};

const remove = async (req, res) => {
  const { privateKey } = req.params; // get private key from request parameter
  try {
    const response = await db.read("upload", "privateKey", privateKey); // get the file info from database matching private key
    await storage.deleteFile(response); // delete file from storage
    await db.remove("upload", "id", response.id); // delete file data from database
    return res.status(500).send({
      message: "File deleted successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Invalid key!",
    });
  }
};

module.exports = { get, upload, remove };
