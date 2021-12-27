const sanitizeHTML = require('sanitize-html');
const marked = require('marked');
const path = require('path');

module.exports.firstFourLines = function(file) {
  file.excerpt = sanitizeHTML(file.content.split('\n').slice(0, 2).join(' '));
}

module.exports.parseMarkdown = function(string) {
  return marked.parse(string);
}

module.exports.getFilesFromDir = async function(dir, fileTypes, fs) {
  var filesToReturn = [];
  async function walkDir(currentPath) {
    var files = await fs.readdirSync(currentPath);
    for (var i in files) {
      var curFile = path.join(currentPath, files[i]);      
      if ((await fs.statSync(curFile)).isFile() && fileTypes.indexOf(path.extname(curFile)) != -1) {
        const _path = curFile.replace(dir, '');
        const stats = await fs.statSync(dir);
        filesToReturn.push({
          path: _path,
          modified_at: stats.mtime,
          name: path.basename(_path),
          basename: path.basename(_path),
          extname: path.extname(_path),
          size: stats.size,
        });
      } else if ((await fs.statSync(curFile)).isDirectory()) {
        walkDir(curFile);
      }
    }
  };
  await walkDir(dir);
  return filesToReturn; 
}

module.exports.streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}

module.exports.streamToBuffer = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  })
}

