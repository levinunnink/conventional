const path = require('path');
const { getFilesFromDir } = require('./utils');

class GetAssetsCommand {
  constructor(root, fs) {
    this.root = root;
    this.fs = fs;
    this.assetExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.mp4', '.webm', '.mp3'];
  }

  async exec() {
    const assetsDir = path.join(this.root);
    return getFilesFromDir(assetsDir, this.assetExtensions, this.fs);
  }
}

module.exports = GetAssetsCommand;
