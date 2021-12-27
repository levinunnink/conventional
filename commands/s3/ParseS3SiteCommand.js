const ParseSiteCommand = require('../ParseSiteCommand');
const s3fs = require('./s3fs');

class ParseS3SiteCommand extends ParseSiteCommand {
  constructor(root, dest) {
    super(root, dest, s3fs);
  }
}

module.exports = ParseS3SiteCommand;
