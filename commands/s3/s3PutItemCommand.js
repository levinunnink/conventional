const path = require('path');
const mime = require('mime-types');
const s3Client = require('../../clients/s3Client');

class S3PutItemCommand {
  constructor(_s3Client) {
    this.s3Client = _s3Client;
  }

  async exec(_path, body) {
    console.log('writing', _path);
    const mimeType = mime.lookup(path.extname(_path));
    return this.s3Client.putObject(_path, body, mimeType);
  }
}

module.exports = new S3PutItemCommand(s3Client);
