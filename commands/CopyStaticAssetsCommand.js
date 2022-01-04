const path = require('path');
const fs = require('fs');
const { getFilesFromDir } = require('./utils');
const mergeConsole = require('../utils/console');

class CopyStaticAssetsCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.fs = _fs;
  }

  async exec(currentDir, outDir) {
    const workDir = path.join(this.root, currentDir);
    const destDir = path.join(this.out, outDir);
    const assets = await getFilesFromDir(workDir, ['.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.html', '.htm'], this.fs);
    assets.forEach(async (asset) => {
      const assetLoaded = await asset;
      const writeDir = path.join(destDir, assetLoaded.path);
      if (!(await this.fs.existsSync(path.dirname(writeDir)))){
        await this.fs.mkdirSync(path.dirname(writeDir), { recursive: true });
      }
      const source = await this.fs.readFileSync(path.join(workDir, assetLoaded.path));
      console.log('writing static asset', writeDir);
      await this.fs.writeFileSync(writeDir, source);
      mergeConsole.debug('wrote static asset', writeDir);
    });
  }
}

module.exports = CopyStaticAssetsCommand;
