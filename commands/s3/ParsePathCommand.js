const path = require('path');
const YAML = require('yaml');
const ParseS3SiteCommand = require('./ParseS3SiteCommand');
const s3fs = require('./s3fs');
const mergeConsole = require('../../utils/console');

class ParsePathCommand {
  constructor(root, dest) {
    this.root = root;
    this.dest = dest;
    this.fs = s3fs;
  }

  async exec(itemPath) {
    let config = {};
    const walkPath = path.join(this.root, itemPath);
    let checkDir = path.dirname(walkPath);
    mergeConsole.debug('parsingPath', itemPath);
    while(checkDir) {
      const indexYAML = path.join(checkDir, '_index.yml');
      const localConfig = await this.fs.existsSync(indexYAML) ? 
        YAML.parse((await this.fs.readFileSync(indexYAML, 'utf8'))) : {};
      config = {...localConfig, ...config};
      checkDir = path.dirname(checkDir);
      // We've passed the root dir. Stop.
      if(checkDir === path.dirname(this.root)) {
        checkDir = false;
      }
    }
    mergeConsole.debug('using config %j', config);
    const command = new ParseS3SiteCommand(this.root, this.dest);
    return command.exec(path.dirname(itemPath), path.dirname(itemPath), config, true);
  }

}

module.exports = ParsePathCommand;
