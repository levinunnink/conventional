const s3Client = require('../../clients/s3Client');

class S3FileExistsCommand {
  constructor(_s3Client) {
    this.s3Client = _s3Client;
  }

  async exec(path) {
    const result = await this.s3Client.headObject(path).catch(err => console.log);
    if(result?.$metadata?.httpStatusCode === 200) return true;
    return false;
  }
}

module.exports = new S3FileExistsCommand(s3Client);
