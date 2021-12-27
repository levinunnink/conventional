const path = require('path');
const matter = require('gray-matter');
const YAML = require('yaml');

const RenderLiquidTemplateCommand = require('./RenderLiquidTemplateCommand');
const GetIndexCommand = require('./GetIndexCommand');
const GetAssetsCommand = require('./GetAssetsCommand');
const mergeConsole = require('../utils/console');
const { firstFourLines, parseMarkdown } = require('./utils');

class BuildMarkdownFileCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.fs = _fs;
    this.renderLiquid = new RenderLiquidTemplateCommand(root, _fs);
    this.getIndex = new GetIndexCommand(root, _fs);
    this.getAssets = new GetAssetsCommand(root, _fs);
  }

  async loadCollections(_path, collections){
    const data = {};
    Object.keys(collections).forEach(async collection => {
      data[collection] = await this.loadCollection(path.join(_path, collection));
    });
    return data;
  }

  async loadCollection(_path) {
    if(!(await this.fs.existsSync(_path))) return [];
    const files = await this.fs.readdirSync(_path);
    const collection = files.map(async file => {
      const sourceData = await this.fs.readFileSync(path.join(_path, file));
      const data = matter(sourceData, { excerpt: firstFourLines });
      return {
        url: `${path.basename(_path)}/${path.basename(file, path.extname(file))}`,
        excerpt: data.excerpt,
        content: parseMarkdown(data.content),
        ...data.data,
      };
    });
    return collection;
  }  

  // Determine where we should publish the markdown
  derivePublishDir(_path) {
    const fileWithNoExtension = _path.replace(path.extname(_path), "");
    // We don't want to build urls like /blog/index/index.html
    if(path.basename(fileWithNoExtension) === "index") {
      return '';
    // We do want to build urls like /blog/my-article/index.html
    } else {
      return path.basename(fileWithNoExtension);
    }
  }

  async exec(_path, outDir, currentConfig) {
    console.debug('path', _path);
    const dataDir = _path.replace(path.extname(_path), "");
    const publishDir = this.derivePublishDir(_path);
    const configPath = path.join(path.dirname(_path), '_index.yml');
    const localConfig = (await this.fs.existsSync(configPath)) 
      ? YAML.parse(await (this.fs.readFileSync(configPath, 'utf8'))) : {};

    let data = {};
    const sourceData = matter((await this.fs.readFileSync(_path, 'utf8')), { excerpt: firstFourLines });
    if (sourceData.data.collections || localConfig.collections) {
      data = await this.loadCollections(dataDir, sourceData.data.collections || localConfig.collections);
    }

    const url = `${outDir}/${publishDir}/`.replace(`${path.dirname(this.root)}/_site`, '');
    const items = await this.getIndex.exec(path.dirname(_path));
    const assets = await this.getAssets.exec();
    const context = { 
      ...sourceData, 
      data,
      items,
      excerpt: sourceData.excerpt,
      content: parseMarkdown(sourceData.content),
      config: currentConfig,
      assets,
      url,
      ...sourceData.data,
      ...data,
    };
    
    const html = await this.renderLiquid.exec('_detail.liquid', context, {
      walkDirectoryStructure: true,
      path: path.dirname(_path),
    });
    
    // Make directories if they don't exist and we're not on S3
    if(process.env.FILESYSTEM && process.env.FILESYSTEM !== 's3') {
      if (!await (this.fs.existsSync(`${outDir}/${publishDir}`))){
        this.fs.mkdirSync(`${outDir}/${publishDir}`, { recursive: true });
      }  
    }
    const publishDest = path.join(outDir, publishDir, 'index.html');
    return this.fs.writeFileSync(publishDest, html);
  }
}

module.exports = BuildMarkdownFileCommand;
