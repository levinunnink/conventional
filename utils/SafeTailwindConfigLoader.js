const { NodeVM } = require('vm2');

class SafeTailwindConfigLoader {
  static load(configString) {
    const vm = new NodeVM({
      console: 'inherit',
      sandbox: {},
      require: {
        external: {
          modules: ['tailwindcss', 'tailwindcss/*', '@tailwindcss/*']
        },  
      }
    });
    let safeConfig = vm.run(configString, `${__dirname}/tailwind.config.js`);
    return safeConfig;
  }
}

module.exports = SafeTailwindConfigLoader;
