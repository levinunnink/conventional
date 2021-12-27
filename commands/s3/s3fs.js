const p = require('path');
const s3Cache = require('./s3Cache');

class S3FS {
  constructor(
    _downloadS3Command,
    _s3ItemExistsCommand,
    _listItemsCommand,
    _putS3ItemCommand,
    ) {
    this.downloadS3Command = _downloadS3Command;
    this.s3ItemExistsCommand = _s3ItemExistsCommand;
    this.putS3ItemCommand = _putS3ItemCommand;
    this.listItemsCommand = _listItemsCommand;
    this.s3Cache = s3Cache;
  }
  getCacheDir() {
    return this.s3Cache.getCacheDir();
  }
  async existsSync(path) {
    if(this.s3Cache.remoteFileExistsSync(path)) return true;
    const result = await this.s3ItemExistsCommand.exec(path);
    this.s3Cache.setRemoteFileExistsSync(path, result);
    return result;
  }
  async readFileSync(path, encoding) {
    const result = await this.downloadS3Command.exec(path, encoding);
    this.s3Cache.saveCachedFile(path, result);
    return result;
  }
  async writeFileSync(path, data) {
    return this.putS3ItemCommand.exec(path, data);
  }
  async mkdirSync(path) {
    return true;
  }
  async readdirSync(path) {
    const items = await this.listItemsCommand.exec(path);
    return items.map(item => item.Key.replace(path, ''));
  }
  async statSync(path) {
    return {
      isFile: () => p.extname(path) !== '',
      isDirectory: () => p.extname(path) === '',
    };
  }
}

module.exports = new S3FS(
  require('./s3DownloadItemCommand'),
  require('./s3FileExistsCommand'),
  require('./s3ListItemsCommand'),
  require('./s3PutItemCommand'),
);

