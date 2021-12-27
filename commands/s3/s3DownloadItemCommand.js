const s3Client = require('../../clients/s3Client');
const { streamToString, streamToBuffer }  = require('../utils');

class S3DownloadItemCommand {
  constructor(_s3Client) {
    this.s3Client = _s3Client;
  }

  async exec(item, encoding) {
    const object = await this.s3Client.getObject(item)
      .catch(err => {
        console.log('This is the item', item);
        console.log(err);
        throw err;
      });
    const body = encoding === 'utf8' ? (await streamToString(object.Body)) : (await streamToBuffer(object.Body));
    return body;
  }
}

module.exports = new S3DownloadItemCommand(s3Client);
