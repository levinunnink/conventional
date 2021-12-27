const fs = require('fs');
const path = require('path');

class S3Cache {
  constructor() {
    this.tmpDir = fs.mkdtempSync('/tmp/s3-cache-');
    this.cacheData = {};
  }
  getCacheDir() {
    return this.tmpDir;
  }
  remoteFileExistsSync(key) {
    return this.cacheData[key];
  }
  setRemoteFileExistsSync(key, result) {
    return this.cacheData[key] = result;
  }
  readCachedFile(key) {
    const readPath = path.join(this.tmpDir, key);
    if(!fs.existsSync(readPath)) return null;
    return fs.readFileSync(path.join(this.tmpDir, key), 'utf8');   
  }
  saveCachedFile(key, data) {
    const writePath = path.join(this.tmpDir, key);
    if(!fs.existsSync(path.dirname(writePath))) {
      fs.mkdirSync(path.dirname(writePath), { recursive: true });
    }
    return fs.writeFileSync(writePath, data);   
  }
}

module.exports = new S3Cache();