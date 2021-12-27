const path = require('path');
const YAML = require('yaml');

const RenderLiquidTemplateCommand = require('./RenderLiquidTemplateCommand');
const GetIndexCommand = require('./GetIndexCommand');
const GetAssetsCommand = require('./GetAssetsCommand');
const mergeConsole = require('../utils/console');

class BuildIndexCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.fs = _fs;
    this.renderLiquid = new RenderLiquidTemplateCommand(root, _fs);
    this.getIndex = new GetIndexCommand(root, _fs);
    this.getAssets = new GetAssetsCommand(root, _fs);
  }

  async exec(_path, outDir, currentConfig) {
    const url = `/${outDir}/`;
    const configPath = path.join(_path, '_index.yml');
    const configExists = await this.fs.existsSync(configPath);
    const localConfig = configExists 
      ? YAML.parse((await this.fs.readFileSync(configPath, 'utf8'))) : {};
    const items = await this.getIndex.exec(_path);
    const assets = await this.getAssets.exec();
    const context = { 
      items,
      assets,
      url,
      config: {
        ...currentConfig,
        ...localConfig,
      },
    };
    const html = await this.renderLiquid.exec('_index.liquid', context, {
      walkDirectoryStructure: true,
      path: _path,
    });
    const writePath = path.join(this.out, outDir);

    // Make directories if they don't exist and we're not on S3
    if(process.env.FILESYSTEM && process.env.FILESYSTEM !== 's3') {
      if (!await (this.fs.existsSync(wr))){
        this.fs.mkdirSync(writePath, { recursive: true });
      }  
    }
  
    mergeConsole.debug('Writing index to', path.join(writePath, 'index.html'));
    await this.fs.writeFileSync(path.join(writePath, 'index.html'), html);
  }
}


module.exports = BuildIndexCommand;