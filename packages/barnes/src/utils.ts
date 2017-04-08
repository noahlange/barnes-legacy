import { safeLoad } from 'js-yaml';
import { isObject } from 'lodash';
import * as _md5 from 'md5-file';
import * as mkdirp from 'mkdirp-promise';
import { readFile, stat, writeFile } from 'mz/fs';
import * as diff from 'object-diff';
import { dirname, extname, posix } from 'path';

import { IFile, IHistoryish } from './types';

export function isFileish<T>(file: any): file is (IFile & T) {
  return file.relativePath && file.contents;
}

export function areFileish<T>(files: any): files is Array<IFile & T> {
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
    accessTime: stats.atime.toJSON(),
    birthTime: stats.birthtime.toJSON(),
    changeTime: stats.ctime.toJSON(),
    contents,
    extension: extname(path),
    history: [],
    md5: await md5(path),
    modifiedTime: stats.mtime.toJSON(),
    path,
    relativePath: posix.relative(dir, path),
    size: stats.size
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
    return { contents: str, meta: null };
  } else {
    const matcher = /\n(\.{3}|-{3})/g;
    const metaEnd = matcher.exec(str);
    if (metaEnd) {
      return {
        contents: str.slice(metaEnd.index),
        meta: safeLoad(str.slice(0, metaEnd.index))
      };
    } else {
      return { contents: str, meta: null };
    }
  }
}
