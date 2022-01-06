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

  async walkDirectories(workDir, destDir, config = {}, onlyMarkdown = false) {
    const currentDir = workDir ? path.join(this.root, workDir) : this.root;
    const outDir = destDir ? path.join(this.dest, destDir) : this.dest;
    const indexYAML = path.join(currentDir, '_index.yml');
    const localConfig = await this.fs.existsSync(indexYAML) ? 
      YAML.parse((await this.fs.readFileSync(indexYAML, 'utf8'))) : {};
    const currentConfig = { ...config, ...localConfig };
    const files = await this.fs.readdirSync(currentDir);
    const promises = [];
    console.log('files', files);
    files.forEach(async file => {
      if(file === 'node_modules') {
        return;
      }
      const _path = path.join(currentDir, file);
      const stat = await this.fs.statSync(_path);
      console.log('path.extname(file)', path.extname(file));
      if (stat.isDirectory()) {
        const operatingDir = workDir ? path.join(workDir, file) : file;
        const operatingOutDir = destDir ? path.join(destDir, file) : file;
        if((await this.fs.existsSync(path.join(currentDir, '_index.liquid')))) {
          const outIndexDir = path.dirname(operatingOutDir);
          promises.push(this.buildIndexCommand.exec(currentDir, outIndexDir, currentConfig));
        }
        if(!onlyMarkdown) promises.push(this.copyStaticAssetsCommand.exec(operatingDir, operatingOutDir, currentConfig));
        promises.push(...await this.walkDirectories(operatingDir, operatingOutDir, currentConfig));
      } else if(path.extname(file) === '.md') {
        promises.push(this.buildMarkdownFile.exec(_path, outDir, currentConfig));
      // } else if(path.extname(file) === '.url' || path.extname(file) === '.webloc') {
      //   await this.buildLinkFileCommand.exec(_path, outDir, currentConfig)
      //     // .catch(err => console.error);
      } else if(path.basename(file) === '_site.css') {
        if(!onlyMarkdown) promises.push(this.buildCSSAssetsCommand.exec(_path, outDir, currentConfig));
      }
    });
    console.log('promises', promises);
    return promises;
  }

  async exec(workDir, destDir, config = {}, onlyMarkdown = false) {
    const promises = await this.walkDirectories(workDir, destDir, config, onlyMarkdown);
    return Promise.all(promises);
  }
}

module.exports = ParseSiteCommand;
