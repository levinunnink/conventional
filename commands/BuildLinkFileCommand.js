const fs = require('fs');
const path = require('path');
const ogs = require('open-graph-scraper');
const urlParser = require('shortcut-url');
const crypto = require('crypto');

const GetAssetsCommand = require('./GetAssetsCommand');
const RenderLiquidTemplateCommand = require('./RenderLiquidTemplateCommand');

class BuildLinkFileCommand {
  constructor(root, out) {
    this.root = root;
    this.out = out;
    this.urlParser = urlParser;
    this.scraper = ogs;
    this.getAssets = new GetAssetsCommand(root, out);
    this.renderLiquid = new RenderLiquidTemplateCommand(root, out);
  }

  saveCache(_path, cache) {
    fs.writeFileSync(path.join(_path, '.cache.json'), JSON.stringify(cache));
  }

  getCache(_path) {
    if(!fs.existsSync(path.join(_path, '.cache.json'))) {
      return {};
    }
    const cacheData = fs.readFileSync(path.join(_path, '.cache.json'), 'utf8');
    return JSON.parse(cacheData);
  }
  
  getIndex(_path, extensions) {
    const items = fs.readdirSync(_path)
      .filter(file => extensions.includes(path.extname(file)))
      .map(file => path.join(_path, file))
      .map(this.getData.bind(this));
    return Promise.all(items);
  }

  async getData(_path) {
    const url = await this.urlParser(_path);
    const cache = this.getCache(path.dirname(_path));
    let scrapeResult;
    if (!cache[url]) {
      const scrape = await this.scraper({ url });
      scrapeResult = scrape.result;
      cache[url] = scrapeResult;
      this.saveCache(path.dirname(_path), cache);
    } else {
      scrapeResult = cache[url];
    }
    return scrapeResult;
  }

  async exec(_path, outDir, currentConfig) {
    const data = await this.getData(_path);
    const publishDir = crypto.createHash('md5').update(data.requestUrl).digest('hex');
    const items = await this.getIndex(path.dirname(_path), ['.webloc', '.url']);
    const localConfig = fs.existsSync(`${_path}/_index.yml`) ? YAML.parse(fs.readFileSync(`${_path}/_index.yml`, 'utf8')) : {};
    const assets = await this.getAssets.exec();
    const url = `${outDir}/${publishDir}/`.replace(`${path.dirname(this.root)}/_site`, '');
    const context = { 
      items,
      assets,
      url,
      config: {
        ...currentConfig,
        ...localConfig,
      },
    };
    console.log('Link File Context', context);
    const html = await this.renderLiquid.exec('_detail.liquid', context, {
      walkDirectoryStructure: true,
      path: path.dirname(_path),
    });
    if (!fs.existsSync(`${outDir}/${publishDir}`)){
      fs.mkdirSync(`${outDir}/${publishDir}`, { recursive: true });
    }
    console.log('Writing to', `${outDir}/${publishDir}/index.html`);
    fs.writeFileSync(`${outDir}/${publishDir}/index.html`, html);

    console.log('GOT URL', url, items);
  }
}

module.exports = BuildLinkFileCommand;
