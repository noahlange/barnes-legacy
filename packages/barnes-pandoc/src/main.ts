import Barnes, { MapFn } from 'barnes';
import * as nodePandoc from 'node-pandoc';

/**
 * Something like a file - needs contents, an extension, an absolute path and
 * a relativePath.
 */
interface IFileish {
  contents: string;
  extension: string;
  path: string;
  relativePath: string;
}

/**
 * A hash of format -> format. Files in keyed formats will be transformed into
 * the formats of their values.
 * ```javascript
 * {
 *   latex: 'commonmark',
 *   rst: 'commonmark',
 *   commonmark: 'html',
 *   // also doable, will override
 *   '*': 'commonmark'
 * }
 * ```
 */
interface IPandocOpts {
  [key: string]: string;
}

const formats = {
  commonmark: '.md',
  docbook: '*',
  docx: '.docx',
  epub: '.epub',
  haddock: '*',
  html: '.html',
  json: '.json',
  latex: '.tex',
  markdown: '.md',
  markdown_github: '.md',
  markdown_mmd: '.md',
  markdown_phpextra: '.md',
  markdown_strict: '.md',
  mediawiki: '*',
  odt: '.odt',
  opml: '.opml',
  org: '*',
  rst: '.rst',
  t2t: '.t2t',
  textile: '.textile',
  twiki: '*'
};

/**
 * Promisified pandoc function.
 */
const _pandoc = (file: string, from: string, to: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const args = `-f ${ from } -t ${ to }`;
    nodePandoc(file, args, (err, res) => err ? reject(err) : resolve(res));
  });
};

export default function pandoc(options: IPandocOpts): MapFn<IFileish, IFileish> {
  const star = Object.keys(options).includes('*');
  // create an extension hash of extension -> format.
  const extensions = {};
  Object.keys(formats).forEach(format => extensions[formats[format]] = format);
  return async (file: IFileish, files: IFileish[], barnes: Barnes<IFileish>): Promise<IFileish> => {
    const starOpts = [ formats[options['*']], options['*'] ];
    const [ fromExt, fromFmt ] = [ file.extension, extensions[file.extension] ];
    const [ toExt, toFmt ] = star ? starOpts : [ formats[options[fromFmt]], options[fromFmt] ];
    const goodToGo = [ fromExt, fromFmt, toExt, toFmt ].every(item => !!item);
    if (goodToGo) {
      file.extension = toExt;
      file.contents = await _pandoc(file.contents, fromFmt, toFmt);
      file.path = file.path.replace(fromExt, toExt);
      file.relativePath = file.path.replace(fromExt, toExt);
    }
    return file;
  };
}
