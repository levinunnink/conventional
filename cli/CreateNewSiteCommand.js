const path = require('path');
const chalk = require('chalk');
const mergeConsole = require('../utils/console');
const DownloadBoilerplateSiteCommand = require('../commands/local/DownloadBoilerplateSiteCommand');

class CreateNewSiteCommand {
  async handle(directoryPath) {

    const answer = await mergeConsole.prompt({
      message: "What kind of site do you want to create",
      name: "boilerplate",
      initial: 1,
      type: 'select',
      choices: [
        "Blank", "BriOS", "Blog", "Image Gallery", "Podcast", "Basic Website",
      ],
    });
    console.log('Test', answer);
    mergeConsole.print(`Creating new briOS boilerplate at: ${chalk.green(path.resolve(directoryPath))}`);
    await DownloadBoilerplateSiteCommand.exec(path.resolve(directoryPath));
    mergeConsole.clear();
    mergeConsole.print(`Site ready: ${chalk.green(path.resolve(directoryPath))}`);
  }
}

module.exports = CreateNewSiteCommand;
