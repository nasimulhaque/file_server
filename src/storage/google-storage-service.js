const configFilePath = process.env.CONFIG;
const { format } = require("util");
const https = require("https");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  keyFilename: configFilePath
});

const bucketName = process.env.FOLDER;

const createDirectory = async () => {
  try {
    const [buckets] = await storage.getBuckets(); // get bucket list
    for (let i = 0; i < buckets.length; i++) {
      // check if required bucket exists in the cloud
      if (buckets[i].metadata.name === bucketName) {
        return;
      }
    }
    await storage.createBucket(bucketName); // create bucket if not exists
    return;
  } catch (error) {
    return error;
  }
};

// get file from storage in response
const getFile = async (res, path) => {
  https.get(path, (stream) => {
    stream.pipe(res);
  });
};

const uploadFile = async (req, res) =>
  new Promise((resolve, reject) => {
    const { filename, buffer } = req.file;

    const bucket = storage.bucket(bucketName);

    const blob = bucket.file(filename);

    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream
      .on("finish", async () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        await bucket.file(filename).makePublic(); // make uploaded file access to public
        resolve(publicUrl);
      })
      .on("error", (error) => {
        reject(`Unable to upload image, something went wrong`);
      })
      .end(buffer);
  });

// delete file from cloud storage
const deleteFile = async (file) => {
  try {
    if(!file) {
      return;
    }
    return await storage.bucket(bucketName).file(file?.name).delete();
  } catch (error) {
    return error;
  }
};

module.exports = { createDirectory, getFile, uploadFile, deleteFile };
