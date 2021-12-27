const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ProgressBar = require('progress');
const unzipper = require('unzipper');

class DownloadBoilerplateSiteCommand {
  static exec(destination) {
    return new Promise(async (resolve) => {
      const url = 'https://conventional-boilerplates-smmall.wunderbucket.dev/boilerplate-v1.zip';
      console.log('Connecting …');
      const { data, headers } = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });
      
      const totalLength = headers['content-length'];
  
      const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
          width: 40,
          complete: '=',
          incomplete: ' ',
          renderThrottle: 1,
          total: parseInt(totalLength)
        });
      const destDir = fs.mkdtempSync('boilerplate-');
      const writer = fs.createWriteStream(
        path.resolve(destDir, 'boilerplate.zip')
      );
  
      data.on('data', (chunk) => progressBar.tick(chunk.length));
      data.pipe(writer);
      data.on('close', () => {
        console.log('Download complete! Unpacking site...');
        fs.createReadStream(`${destDir}/boilerplate.zip`)
          .pipe(unzipper.Extract({ path: destination }))
          .on('entry', entry => entry.autodrain())
          .promise()
          .then(resolve);
      });
    });
  }
}

module.exports = DownloadBoilerplateSiteCommand;
