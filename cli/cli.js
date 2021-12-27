const commander = require('commander');
const packageInfo = require('../../package.json');
const CompileDirectoryCommand = require('./CompileDirectoryCommand');
const StartServerCommand = require('./StartServerCommand');
const CreateNewSiteCommand = require('./CreateNewSiteCommand');

class ConventionalCLI {
  constructor() {
    this.commander = commander;
    this.commander.version(packageInfo.version);
    this.compileDirectoryCommand = new CompileDirectoryCommand();
    this.startServerCommand = new StartServerCommand();
    this.createNewSiteCommand = new CreateNewSiteCommand();
  }

  parse(argv) {
    this.commander.command('watch <sourceDirectory> [sitePath]')
      .description('Watches and serves a local directory using the conventional runtime')
      .action(this.startServerCommand.handle);
    this.commander.command('build <directory> [destinationPath]')
      .description('Builds the local HTML and outputs it to the destination path')
      .action(this.compileDirectoryCommand.handle);
    this.commander.command('new <directory>')
      .description('Creates a new Conventional project in the specified directory')
      .action(this.createNewSiteCommand.handle);
    this.commander.parse(argv);
    if (!argv.slice(2).length) {
      this.commander.outputHelp();
    }
  }
}

module.exports = new ConventionalCLI();
