import Barnes, { MapFn } from 'barnes';
import * as hljs from 'highlight.js';
import * as MarkdownIt from 'markdown-it';
import * as meta from 'markdown-it-meta';

function highlight(str: string, lang: string) {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(lang, str).value;
  }
  return str;
}

interface IFileish {
  contents: string;
  path: string;
  relativePath: string;
}

export default function markdown(opts: MarkdownIt.Options, md?: MarkdownIt.MarkdownIt): MapFn<IFileish, IFileish> {
  const options = Object.assign({ highlight }, opts);
  md = md ? md : new MarkdownIt(options);
  md.use(meta);
  return function markdown(file: IFileish, files: IFileish[], barnes: Barnes<any>): IFileish {
    file.contents = md.render(file.contents);
    file.path = file.path.replace('.md', '.html');
    file.relativePath = file.relativePath.replace('.md', '.html');
    return file;
  };
}
