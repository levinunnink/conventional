const path = require('path');
const fs = require('fs');
const { getFilesFromDir } = require('./utils');
const mergeConsole = require('../utils/console');
const CopyAssetCommand = require('./CopyAssetCommand');

class CopyStaticAssetsCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.fs = _fs;
    this.extensions = ['.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.html', '.htm', '.mp4', '.webm', '.mp3'];
  }

  async exec(currentDir, outDir) {
    const workDir = path.join(this.root, currentDir);
    const destDir = path.join(this.out, outDir);
    const assets = await getFilesFromDir(workDir, this.extensions, this.fs);
    assets.forEach(async (asset) => {
      const assetLoaded = await asset;
      const writeTo = path.join(destDir, assetLoaded.path);
      const writeFrom = path.join(workDir, assetLoaded.path);
      const copyCommand = new CopyAssetCommand(writeFrom, writeTo, this.fs);
      await copyCommand.exec();
    });
  }
}

module.exports = CopyStaticAssetsCommand;
