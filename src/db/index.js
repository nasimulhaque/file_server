var sqlite3 = require("sqlite3").verbose();
const { promisify } = require("util");
const path = require("path");
const { table } = require("console");

const dbFilePath = path.join(__dirname, "mydb.sqlite"); // database location
const db = new sqlite3.Database(dbFilePath);

const query = promisify(db.all).bind(db);

// file upload table creation query
const createUploadTableQuery = `CREATE TABLE IF NOT EXISTS upload (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text,
    mimeType text,
    location text,
    provider text,
    publicKey text, 
    privateKey text, 
    uploadedAt text,
    downloadedAt text
)`;

// usage table creation query
const createStatusTableQuery = `CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date text,
    upload INTEGER,
    download INTEGER
)`;

// database insert method
const create = async (object, table) => {
  const keys = Object.keys(object).join(",");
  const values = Object.values(object)
    .map((v) => `"${v}"`)
    .join(",");
  const queryString = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
  return await query(queryString);
};

// database read method
const read = async (table, col, val) => {
  const queryString = `SELECT * FROM ${table} where ${col}="${val}" LIMIT 1`;
  const res = await query(queryString);
  return res.length > 0 ? res[0] : null;
};

// database update method
const update = async (obj, table, col, val) => {
  let str = "";
  let separator = "";
  for (const [p, val] of Object.entries(obj)) {
    str += `${separator}${p}=${val}`;
    separator = ",";
  }
  const queryString = `UPDATE ${table} SET ${str} where ${col}="${val}"`;
  return await query(queryString);
};

// database delete mothod
const remove = async (table, col, val) => {
  const queryString = `DELETE FROM ${table} where ${col}="${val}"`;
  const res = await query(queryString);
  return res.length > 0 ? res[0] : null;
};

// initialize database
const init = async () => {
  // Create users table if it doesn't exist.
  await query(createUploadTableQuery);
  await query(createStatusTableQuery);
};

// export all the methods
module.exports = {
  init,
  query,
  create,
  read,
  update,
  remove,
};
