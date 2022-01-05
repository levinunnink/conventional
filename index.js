const ParseSiteCommand = require('./commands/ParseSiteCommand');
const ParseS3SiteCommand = require('./commands/s3/ParseS3SiteCommand');
const BuildMarkdownFileCommand = require('./commands/BuildMarkdownFileCommand');
const BuildIndexCommand = require('./commands/BuildIndexCommand');
const BuildCSSAssetsCommand = require('./commands/BuildCSSAssetsCommand');
const CopyStaticAssetsCommand = require('./commands/CopyStaticAssetsCommand');
const CopyAssetCommand = require('./commands/CopyAssetCommand');
const ParsePathCommand = require('./commands/s3/ParsePathCommand');
const s3fs = require('./commands/s3/s3fs');

module.exports = {
  ParseSiteCommand,
  ParseS3SiteCommand,
  BuildMarkdownFileCommand,
  BuildIndexCommand,
  BuildCSSAssetsCommand,
  CopyStaticAssetsCommand,
  CopyAssetCommand,
  ParsePathCommand,
  s3fs,
};
