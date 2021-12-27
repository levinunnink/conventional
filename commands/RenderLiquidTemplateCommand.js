const path = require('path');
const { Liquid } = require('liquidjs');
const pretty = require('pretty');
const mergeConsole = require('../utils/console');

class RenderLiquidTemplateCommand {
  constructor(root, _fs) {
    this.root = root;
    this.fs = _fs;
    if(process.env.FILESYSTEM === 's3') {
      this.abstractFileSystem = require('./s3/s3LiquidFileSystem');
    }
  }

  async exec(template, data, options) {
    const templatePath = path.join(options.path, template);

    // Walk our directory upwards until we find a template
    if(
      !(await this.fs.existsSync(templatePath)) 
      && options.walkDirectoryStructure
      && options.path !== this.root
    ) {
      mergeConsole.debug('Walking up to find template', templatePath);
      return this.exec(template, data, {
        ...options,
        path: path.dirname(options.path),
      });
    }
    if(!(await this.fs.existsSync(templatePath))) {
      throw new Error(`Template ${templatePath} does not exist`);
    }
    
    const config = {
      cache: false,
      root: options.path,
      partials: [this.root, path.join(this.root, '_partials')],
    };

    if(this.root !== options.path) {
      config.layouts = [this.root, path.dirname(options.path)];
    } else {
      config.layouts = [this.root];
    }
    
    if(this.abstractFileSystem) {
      config.fs = this.abstractFileSystem;
    }

    const engine = new Liquid(config);

    const templateString = await this.fs.readFileSync(templatePath, 'utf8');

    const html = await engine.parseAndRender(templateString, data);

    return pretty(html, { ocd: true });
  }
}

module.exports = RenderLiquidTemplateCommand;
