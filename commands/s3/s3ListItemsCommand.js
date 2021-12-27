const s3Client = require('../../clients/s3Client');

class S3ListItemsCommand {
  constructor(_s3Client) {
    this.s3Client = _s3Client;
  }

  async exec(path) {
    return await this.s3Client.listAllObjects(path);
  }
}

module.exports = new S3ListItemsCommand(s3Client);
