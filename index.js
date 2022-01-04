const ParseSiteCommand = require('./commands/ParseSiteCommand');
const ParseS3SiteCommand = require('./commands/s3/ParseS3SiteCommand');
const BuildMarkdownFileCommand = require('./commands/BuildMarkdownFileCommand');
const BuildIndexCommand = require('./commands/BuildIndexCommand');
const BuildCSSAssetsCommand = require('./commands/BuildCSSAssetsCommand');
const CopyStaticAssetsCommand = require('./commands/CopyStaticAssetsCommand');
const CopyAssetCommand = require('./commands/CopyAssetCommand');

module.exports = {
  ParseSiteCommand,
  ParseS3SiteCommand,
  BuildMarkdownFileCommand,
  BuildIndexCommand,
  BuildCSSAssetsCommand,
  CopyStaticAssetsCommand,
  CopyAssetCommand,
};
