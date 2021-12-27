const path = require('path');
const matter = require('gray-matter');

const { firstFourLines, parseMarkdown } = require('./utils');

class GetIndexCommand {
  constructor(root, _fs) {
    this.root = root;
    this.matter = matter;
    this.fs = _fs;
  }

  async exec(_path, extensions = ['.md', '.markdown']) {
    const items = (await this.fs.readdirSync(_path))
      .filter(file => extensions.includes(path.extname(file)))
      .map(async file => {
        return {
          raw: (await this.fs.readFileSync(path.join(_path, file), 'utf8')),
          path: file,
        }
      })
      .map(async (file) => {
        const data = await file;
        return {
          ...this.matter(
            data.raw,
            { excerpt: firstFourLines }
          ),
          file: data.path,
        };
      })
      .map(async file => {
        const data = await file;
        return {
          url: `/${path.basename(_path)}/${path.basename(data.file, path.extname(data.file))}/`,
          excerpt: data.excerpt,
          content: parseMarkdown(data.content),
          ...data.data,
        };
      });
    return items;
  }
}

module.exports = GetIndexCommand;
