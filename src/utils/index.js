const crypto = require("crypto");

const algorithm = "aes-256-cbc";
const key_1 = Buffer.from('jofwkejljslkldjksklksljelapelkoh'); // cipher key for public key generation
const key_2 = Buffer.from('0ouwkejljelajs2ldjkssljelnw8uwya'); // cipher key for private key generation
const iv = Buffer.from('owejlanljklkjljl');

// function to generate public and private keys as identifier of image for the get and delete operations
function generateKeys(text) {
  var cipher_1 = crypto.createCipheriv(algorithm, key_1, iv);
  var cipher_2 = crypto.createCipheriv(algorithm, key_2, iv);
  var publicKey = cipher_1.update(text, "utf8", "hex") + cipher_1.final("hex");
  var privateKey = cipher_2.update(text, "utf8", "hex") + cipher_2.final("hex");
  return {
    publicKey,
    privateKey
  };
}


function decryptPublicKey(text) {
  var decipher = crypto.createDecipheriv(algorithm, key_1, iv);
  var decrypted = decipher.update(text, "hex", "utf8") + decipher.final("utf8");
  return decrypted;
}

function decryptPrivateKey(text) {
  var decipher = crypto.createDecipheriv(algorithm, key_2, iv);
  var decrypted = decipher.update(text, "hex", "utf8") + decipher.final("utf8");
  return decrypted;
}

// function to convert bytes to KB/MB/GB
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

module.exports = { generateKeys, decryptPublicKey, decryptPrivateKey, formatBytes };
