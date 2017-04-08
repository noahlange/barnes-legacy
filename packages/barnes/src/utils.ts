import * as _md5 from 'md5-file';
import { safeLoad } from 'js-yaml';
import { IFile, IHistoryish } from './types';
import Barnes from './Barnes';
import * as mkdirp from 'mkdirp-promise';
import { posix, extname, dirname, resolve } from 'path';
import { readFile, writeFile, stat } from 'mz/fs';
import { isObject } from 'lodash';
import * as diff from 'object-diff';

export function isFileish<T>(file: any): file is (IFile & T) {
  return file.relativePath && file.contents;
}

export function areFileish<T>(files: any): files is (IFile & T)[] {
  return files.every(isFileish);
}

export function hasHistory<O extends IFile>(obj: O ): obj is O & IHistoryish {
  return isObject(obj) && Array.isArray(obj.history);
}

export function appendToHistory<I, O>(prev: I, curr: O & IHistoryish): O & IHistoryish {
  const patch = diff(prev, curr);
  const history = Object.assign({ id: curr.history.length + 1 }, patch);
  curr.history.push(history);
  return curr;
}

export async function getFile(dir, path) {
  const stats = await stat(path);
  let contents = await readFile(path, 'utf8');
  let meta = {};
  if (path.endsWith('.md')) {
    const data = metamarked(contents);
    meta = data.meta;
    contents = data.contents;
  }
  const out = {
    path,
    relativePath: posix.relative(dir, path),
    contents,
    extension: extname(path),
    history: [],
    size: stats.size,
    modifiedTime: stats.mtime.toJSON(),
    accessTime: stats.atime.toJSON(),
    changeTime: stats.ctime.toJSON(),
    birthTime: stats.birthtime.toJSON(),
    md5: await md5(path)
  };
  return Object.assign(out, meta);
}

/**
 * Creates a new file, mkdirping if necessary.
 */
export async function makeFile(file: any, contents: string) {
  await mkdirp(dirname(file));
  await writeFile(file, contents);
}

export function md5(absolutePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    return _md5(absolutePath, (err, res) => {
      err ? reject(err) : resolve(res);
    });
  });
}

export function metamarked(str: string) {
  if (str.slice(0, 3) !== '---') {
    return { meta: null, contents: str };
  } else {
    const matcher = /\n(\.{3}|-{3})/g;
    const metaEnd = matcher.exec(str);
    if (metaEnd) {
      return {
        meta: safeLoad(str.slice(0, metaEnd.index)),
        contents: str.slice(metaEnd.index)
      };
    } else {
      return { meta: null, contents: str };
    }
  }
}