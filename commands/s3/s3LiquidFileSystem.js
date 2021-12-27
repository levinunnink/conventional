const s3fs = require('./s3fs');
const { sep, join, extname, dirname } = require('path');

module.exports = {
  readFileSync: async (file) => {
    throw new Error('Cannot run readFileSync on S3. Please use async methods.');
  },
  readFile: async (file) => {
    return s3fs.readFileSync(await file, 'utf8');
  },
  existsSync: async (path) => {
    throw new Error('Cannot run existsSync on S3. Please use async methods.');
  },
  exists: async (path) => {
    return s3fs.existsSync(await path);
  },
  contains: async (root, file) => {
    root = root.endsWith(sep) ? root : root + sep
    return (await file).startsWith(root);
  },
  resolve: async (root, file, ext) => {
    if (!extname(file)) file += ext;
    const resolved = join(root, file);
    return resolved;
  },
  sep,
  dirname,
};
