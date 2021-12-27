const path = require('path');
const chalk = require('chalk');
const mergeConsole = require('../utils/console');
const ParseSiteCommand = require('../commands/ParseSiteCommand');
const chokidar = require('chokidar');

class WatchDirectoryCommand {
  constructor(root, out) {
    this.root = root;
    this.out = out;
    this.command = new ParseSiteCommand(this.root, this.out);
  }

  async handle(rebuildCallback) {
    mergeConsole.print(`Watching: ${chalk.green(path.resolve(this.root))}`);
    this.watcher = chokidar.watch(path.resolve(this.root), { ignored: /^\./, persistent: true, ignoreInitial: true });
    this.watcher.on('add', () => this.command.exec().then(rebuildCallback));
    this.watcher.on('unlink', () => this.command.exec().then(rebuildCallback));
    this.watcher.on('change', () => this.command.exec().then(rebuildCallback));
    this.watcher.on('rename', () => this.command.exec().then(rebuildCallback));
  }
}

module.exports = WatchDirectoryCommand;
