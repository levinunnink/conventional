const getPort = require('get-port');
const openUrl = require('openurl');
const autoBind = require('auto-bind');
const chalk = require('chalk');

const mergeConsole = require('../utils/console');
const Server = require('../server/Server');
const WatchDirectoryCommand = require('./WatchDirectoryCommand');

class StartServerCommand {
  constructor() {
    autoBind(this);
    this.getPort = getPort;
  }

  async handle(directoryPath, destinationPath) {
    mergeConsole.animate('Starting Conventional dev server');
    const port = await this.getPort();
    const server = new Server(port, destinationPath);
    server.on('ready', () => {
      mergeConsole.clear();
      mergeConsole.print(`Server is listening on ${chalk.underline(chalk.green(`http://localhost:${port}`))}`);
    });
    server.on('error', (error) => {
      mergeConsole.error(`${error}\n`);
    });
    server.on('load', (path) => {
      mergeConsole.print(`Loading ${chalk.green(path)}`);
    });
    server.start();
    openUrl.open(`http://localhost:${port}`);

    // Watch directory
    this.watchCommand = new WatchDirectoryCommand(directoryPath, destinationPath);
    await this.watchCommand.handle(() => server.reloadSite());
  }
}

module.exports = StartServerCommand;
