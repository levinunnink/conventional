const vm = require('vm');
const path = require('path');
const mergeConsole = require('../utils/console');

class BuildCSSAssetsCommand {
  constructor(root, out, _fs) {
    this.root = root;
    this.out = out;
    this.postcss = require('postcss');
    this.tailwindcss = require('tailwindcss');
    this.autoprefixer = require('autoprefixer');
    this.atImport = require('postcss-import');
    this.defaultTailwindConfig = require('./_default.tailwind.config.js');
    this.fs = _fs;
  }
  
  async exec(_path, outDir) {
    return new Promise(async (resolve) => {
      mergeConsole.debug('loading css', _path);
      const css = await this.fs.readFileSync(_path, 'utf8');
      const workDir = process.env.FILESYSTEM === 's3' ? this.fs.getCacheDir() : this.root;
      let defaultTemplates = `${workDir}/**/*.{liquid,html,md,js}`;
      const defaultConfig = this.defaultTailwindConfig;
      const configOverrideExists = await this.fs.existsSync(`${path.dirname(_path)}/_tailwind.config.js`);
      let configOverride = {};
      // Note: We need to download all of our files to our cache dir
      // Ugly hack to get around the fact that we can't use the abstract file system
      if(process.env.FILESYSTEM === 's3') {
        const assets = await this.fs.readdirSync(path.dirname(_path));
        await Promise.all(assets.map(async (file) => {
          const readPath = path.join(path.dirname(_path), file);
          if((await this.fs.statSync(readPath)).isDirectory()) {
            return Promise.resolve();
          }
          return this.fs.readFileSync(readPath, 'utf8');
        }));
      }
      if(configOverrideExists && process.env.FILESYSTEM === 's3') {
        const data = await this.fs.readFileSync(`${path.dirname(_path)}/_tailwind.config.js`, 'utf8');
        configOverride = eval(`'use strict'; ${data}`);
      } else if(configOverrideExists) {
        configOverride = require(`${path.dirname(_path)}/_tailwind.config.js`);
      }
      const config = {
        ...defaultConfig,
        ...configOverride,
      };
      config.content = [...config.content, defaultTemplates];
      const destDir = path.join(this.out, '_assets');
      const importer = this.atImport({
        path: [workDir, path.join(workDir, path.dirname(_path)), path.dirname(_path)],
      });
      const result = await this.postcss([
        importer,
        this.tailwindcss(config),
        require('autoprefixer'),
      ]).process(css, {
        from: process.env.FILESYSTEM !== 's3' ? _path : undefined,
      });
      if(!(await this.fs.existsSync(destDir))) {
        await this.fs.mkdirSync(destDir, { recursive: true });
      }
      await this.fs.writeFileSync(`${destDir}/_site.css`, result.css);
      mergeConsole.debug('Wrote CSS to', `${destDir}/_site.css`);
      resolve();
    });
  }
}

module.exports = BuildCSSAssetsCommand;
