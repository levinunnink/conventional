const path = require('path');
const mergeConsole = require('../utils/console');

class CopyAssetCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.fs = _fs;
  }
  
  async exec() {
    if (!(await this.fs.existsSync(path.dirname(this.out)))){
      await this.fs.mkdirSync(path.dirname(this.out), { recursive: true });
    }
    const source = await this.fs.readFileSync(this.root);
    mergeConsole.debug('writing static asset', this.out);
    return this.fs.writeFileSync(this.out, source);
  }
}

module.exports = CopyAssetCommand;
