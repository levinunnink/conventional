const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const mergeConsole = require('../utils/console');
const ParseSiteCommand = require('../commands/ParseSiteCommand');

class CompileDirectoryPath {
  async handle(directoryPath, destinationPath) {
    mergeConsole.print(`Starting build for dir: ${chalk.green(path.resolve(directoryPath))}`);
    const command = new ParseSiteCommand(path.resolve(directoryPath), path.resolve(destinationPath), fs);
    await command.exec();
    mergeConsole.clear();
    mergeConsole.print(`Build complete: ${chalk.green(path.resolve(destinationPath))}`);
  }
}

module.exports = CompileDirectoryPath;
