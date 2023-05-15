const fs = require("fs");
const ms = require("ms");
const db = require("../db");
const provider = process.env.PROVIDER || "local"; // ex. local, google
const storageProvider = require(`./${provider}-storage-service`);

const init = async () => {
  await storageProvider.createDirectory();
  await scheduleLimitCheck();
  await scheduleCleanupCheck();
};

// function to periodically check the upload and download limit as per input
async function scheduleLimitCheck() {
  await checkFileTransferLimit();
  setTimeout(
    scheduleLimitCheck,
    ms(process.env.FILE_TRANSFER_LIMIT_CHECK_TIME_PERIOD)
  );
}

// function to periodically check the unused file for deletion as per input
async function scheduleCleanupCheck() {
  await checkUnusedFiles();
  setTimeout(
    scheduleCleanupCheck,
    ms(process.env.FILE_CLEANUP_CHECK_TIME_PERIOD)
  );
}

async function checkFileTransferLimit() {
  const today = new Date().toLocaleDateString("en-US"); // ex. 5/15/2023
  const response = await db.read("status", "id", 1); // get usage from database
  if (!response) { // if usage is not set in database, create one
    await db.create(
      {
        id: 1,
        date: `"${today}"`,
        upload: 0,
        download: 0,
      },
      "status"
    );
    return;
  } else if (response?.date !== today) { // if usage for today is not set, update it to initialize
    await db.update(
      {
        date: `"${today}"`,
        upload: 0,
        download: 0,
      },
      "status",
      "id",
      1
    );
    return;
  } else { // todays usage is already set
    return;
  }
}

async function checkUnusedFiles() {
  const date = new Date(
    Date.now() - ms(process.env.UNUSED_FILE_MAX_TIME_PERIOD)
  ).getTime();
  const response = await db.query(  // get all the unused file list from database
    `SELECT * FROM upload where downloadedAt<${date}`
  );
  if (response.length == 0) {
    return response;
  }
  await deleteUnusedFiles(response);
}

// function to delete unused files from storage and database
async function deleteUnusedFiles(response) {
  for (let i = 0; i < response.length; i++) {
    if (response[i].provider !== provider) {
      return;
    }
    await storageProvider.deleteFile(response[i]);
    await db.query(`DELETE FROM upload where id=${response[i].id}`);
  }
  return;
}

module.exports = { init, ...storageProvider };
