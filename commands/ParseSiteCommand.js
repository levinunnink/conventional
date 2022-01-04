const YAML = require('yaml');
const path = require('path');

const BuildIndexCommand = require('./BuildIndexCommand');
const BuildMarkdownFileCommand= require('./BuildMarkdownFileCommand');
const BuildCSSAssetsCommand = require('./BuildCSSAssetsCommand');
const CopyStaticAssetsCommand = require('./CopyStaticAssetsCommand');
const BuildLinkFileCommand = require('./BuildLinkFileCommand');

class ParseSiteCommand {
  constructor(root, dest, _fs) {
    this.root = root;
    this.dest = dest;
    this.buildIndexCommand = new BuildIndexCommand(root, dest, _fs);
    this.buildMarkdownFile = new BuildMarkdownFileCommand(root, dest, _fs);
    this.buildCSSAssetsCommand = new BuildCSSAssetsCommand(root, dest, _fs);
    this.copyStaticAssetsCommand = new CopyStaticAssetsCommand(root, dest, _fs);
    this.buildLinkFileCommand = new BuildLinkFileCommand(root, dest, _fs);
    this.fs = _fs;
  }

  async walkDirectories(workDir, destDir, config = {}) {
    const currentDir = workDir ? path.join(this.root, workDir) : this.root;
    const outDir = destDir ? path.join(this.dest, destDir) : this.dest;
    const indexYAML = path.join(currentDir, '_index.yml');
    const localConfig = await this.fs.existsSync(indexYAML) ? 
      YAML.parse((await this.fs.readFileSync(indexYAML, 'utf8'))) : {};
    const currentConfig = { ...config, ...localConfig };
    const files = await this.fs.readdirSync(currentDir);
    const promises = [];
    files.forEach(async file => {
      if(file === 'node_modules') {
        return;
      }
      const _path = path.join(currentDir, file);
      const stat = await this.fs.statSync(_path);
      if (stat.isDirectory()) {
        const operatingDir = workDir ? path.join(workDir, file) : file;
        const operatingOutDir = destDir ? path.join(destDir, file) : file;
        if((await this.fs.existsSync(path.join(_path, '_index.liquid')))) {
          promises.push(this.buildIndexCommand.exec(_path, operatingOutDir, currentConfig));
        }
        promises.push(this.copyStaticAssetsCommand.exec(operatingDir, operatingOutDir, currentConfig));
        promises.push(...await this.walkDirectories(operatingDir, operatingOutDir, currentConfig));
      } else if(path.extname(file) === '.md') {
        promises.push(this.buildMarkdownFile.exec(_path, outDir, currentConfig));
      // } else if(path.extname(file) === '.url' || path.extname(file) === '.webloc') {
      //   await this.buildLinkFileCommand.exec(_path, outDir, currentConfig)
      //     // .catch(err => console.error);
      } else if(path.basename(file) === '_site.css') {
        promises.push(this.buildCSSAssetsCommand.exec(_path, outDir, currentConfig));
      }
    });
    return promises;
  }

  async exec(workDir, destDir, config = {}) {
    const promises = await this.walkDirectories(workDir, destDir, config);
    return Promise.all(promises);
  }
}

module.exports = ParseSiteCommand;
