import * as asyncMergeSort from 'async-merge-sort';
import * as Debug from 'debug';
import * as glob from 'glob-promise';
import { resolve } from 'path';
import * as pretty from 'prettyjson';

import { CALLBACK, ICallbackRecord, IFile } from './types';
import { FetchFn, FilterFn, FromFn, MapFn, ReduceFn, RenderFn, SeriesFn, SortFn, ToFn, WriteFn } from './types';
import { appendToHistory, areFileish, getFile, hasHistory, isFileish, makeFile } from './utils';

const debug = Debug('barnes');

export default class Barnes<T> {

  public cwd: string;
  public meta: Map<any, any> = new Map();
  private _files: T[] = [];
  private _fns: ICallbackRecord[] = [];

  public get length() {
    return this._files.length;
  }

  public set(key: any, value: any): Barnes<T> {
    this._fns.push({ data: { key, value }, type: CALLBACK.SET });
    return this;
  }

  /**
   * Executes functions in order, then calls user-supplied callback.
   */
  public then(callback: () => Promise<any>): Promise<any> {
    return this._execute().then(callback);
  }

  public catch(callback: () => Promise<any>): Promise<any> {
    return this._execute().catch(callback);
  }

  /**
   * Fetches and populates items from remote resource.
   */
  public fetch<O>(callback: FetchFn): Barnes<any[]> {
    debug(`added fetch`);
    this._fns.push({ callback, type: CALLBACK.FETCH });
    return this._clone<any>();
  }

  /**
   * Fetches from arbitrary async or sync resource.
   */
  public from<O>(callback: FromFn<O>): Barnes<T & O> {
    debug(`added from`);
    this._fns.push({ callback, type: CALLBACK.FROM });
    return this._clone<T & O>();
  }

  public to(callback: ToFn<T>): this {
    debug(`added to`);
    this._fns.push({ callback, type: CALLBACK.TO });
    return this;
  }

  public read(dir: string | string[]): Barnes<IFile> {
    debug(`added read - ${ dir }`);
    this._fns.push({ data: { dir }, type: CALLBACK.READ });
    return this._clone<IFile>();
  }

  public write(dir: string | WriteFn<T>) {
    debug(`added to - ${ dir }`);
    this._fns.push({ data: { dir }, type: CALLBACK.WRITE });
    return this;
  }

  public use<O>(barnes: Barnes<O>): Barnes<T & O> {
    debug(`using barnes`);
    if (!barnes.cwd) {
      barnes.cwd = this.cwd;
    }
    this._fns.push({ data: { barnes }, type: CALLBACK.USE });
    return this._clone<T & O>();
  }

  /**
   * Logs each item to stdout, either pretty-printed or using a user-supplied
   * stringifying callback.
   */
  public log(callback?: RenderFn<T>) {
    debug(`added log`);
    this._fns.push({ callback, type: CALLBACK.LOG });
    return this;
  }

  public map<O>(callback: MapFn<T, O>) {
    debug(`added map plugin - ${ callback.name }`);
    this._fns.push({ callback, type: CALLBACK.MAP });
    return this._clone<O>();
  }

  public series<O>(callback: SeriesFn<T, O>) {
    debug(`added series plugin - ${ callback.name }`);
    this._fns.push({ callback, type: CALLBACK.SERIES });
    return this._clone<O>();
  }

  public reduce<O>(callback: ReduceFn<T, O[]>, initialValue?: O[]): Barnes<O>;
  public reduce<O>(callback: ReduceFn<T, O>, initial?: O): Barnes<O> {
    debug(`added reduce plugin - ${ callback.name }`);
    this._fns.push({ callback, data: { initial }, type: CALLBACK.REDUCE });
    return this._clone<O>();
  }

  public filter(callback: FilterFn<T>) {
    debug(`added filter plugin - ${ callback.name }`);
    this._fns.push({ callback, type: CALLBACK.FILTER });
    return this;
  }

  public sort(callback: SortFn<T>) {
    debug(`added sort plugin - ${ callback.name }`);
    this._fns.push({ callback, type: CALLBACK.SORT });
  }

  private _clone<T>(): Barnes<T> {
    const barnes = new Barnes<T>(this.cwd);
    barnes._fns = this._fns.slice(0);
    barnes.meta = new Map(this.meta);
    return barnes;
  }

  private async callback<O>(record: ICallbackRecord, files: T | T[]): Promise<O[]> {
    files = Array.isArray(files) ? files : [ files ];
    debug(`executing plugin ${ CALLBACK[record.type] } on ${ files && files.length ? files.length : 0 } files`);
    const time = process.hrtime();
    let res = [];
    switch (record.type) {
      case CALLBACK.SET:
        res = await this._set(files, record.data.key, record.data.value);
        break;
      case CALLBACK.USE:
        const barnes = record.data.barnes;
        const clone = new Barnes<T>(barnes.cwd);
        clone._fns = [];
        clone._files = await barnes;
        clone.meta = new Map(barnes.meta);
        res = [ ...files, clone ];
        break;
      case CALLBACK.LOG:
        res = await this._log(files, record.callback);
        break;
      case CALLBACK.MAP:
        res = await this._map<O>(files, record.callback);
        break;
      case CALLBACK.SERIES:
        res = await this._series(files, record.callback);
        break;
      case CALLBACK.FILTER:
        res = await this._filter(files, record.callback);
        break;
      case CALLBACK.REDUCE:
        res = await this._reduce(files, record.callback, record.data.initial);
        break;
      case CALLBACK.SORT:
        res = await this._sort(files, record.callback);
        break;
      case CALLBACK.FETCH:
        res = await this._fetch(record.callback);
        break;
      case CALLBACK.FROM:
        res = await this._from(record.callback);
        break;
      case CALLBACK.TO:
        res = await this._to(files, record.callback);
        break;
      case CALLBACK.READ:
        res = await this._read(record.data.dir);
        break;
      case CALLBACK.WRITE:
        if (areFileish<T>(files)) {
          await this._write(files, record.data.dir);
        } else {
          throw new Error('Cannot write files without paths and contents.');
        }
        break;
      default:
        res = res;
        break;
    }
    const diff = process.hrtime(time);
    debug(`plugin took ${ (diff[0] * 1e3) + (diff[1] / 1e6) } ms`);
    return res;
  }

  private async _execute() {
    let res;
    for (const fn of this._fns) {
      res = await this.callback(fn, this._files);
    }
    return res;
  }

  private async _set(files: T[], key, value) {
    this.meta.set(key, await value);
    return files;
  }

  private async _log(files: T[], callback?: RenderFn<T>) {
    for (const file of files) {
      let info;
      if (callback) {
        info = callback(file, files, this);
      } else {
        info = pretty.render(file);
      }
      console.info(info);
    }
    return files;
  }

  private async _reduce<O>(files: T[], callback, i) {
    return files.reduce(async (prev, curr, idx, array) => {
      return callback(await prev, curr, array, this);
    }, i);
  }

  private async _series<O>(files: T[], callback: SeriesFn<T, O>): Promise<O[]> {
    let out = [];
    for (const file of files) {
      out.push(await callback(file, files, this));
    }
    return out;
  }

  private async _map<O>(files: T[], callback: MapFn<T, O>): Promise<O[]> {
    return await Promise.all(files.map(async (file, idx, arr) => {
      const clone = Object.assign({}, file);
      let curr = await callback(file, arr, this);
      if (isFileish<O>(curr) && hasHistory(curr)) {
        curr = appendToHistory<T, O>(clone, curr);
      }
      return curr;
    }));
  }

  private async _filter(files: T[], callback: FilterFn<T>): Promise<T[]> {
    const out = [];
    for (const file of files) {
      const test = await callback(file, files, this);
      if (test) {
        out.push(file);
      }
    }
    return out;
  }

  private async _sort(files: T[], callback: SortFn<T>): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      asyncMergeSort(files, async (a, b, cb) => {
        cb(null, await callback(a, b, files, this));
      }, (err, sorted: T[]) => resolve(sorted));
    });
  }

  private async _from<O>(callback: FromFn<O>) {
    return await callback();
  }

  private async _fetch(callback: FetchFn) {
    const res = await callback();
    const json = await res.json();
    return Array.isArray(json) ? json : [ json ];
  }

  private async _to(files: T[], callback: ToFn<T>) {
    for (const file of files) {
      await callback(file, files, this);
    }
    return files;
  }

  private async _read(dirname: string | string[]) {
    const out = [];
    const dirs = Array.isArray(dirname) ? dirname : [ dirname ];
    for (const dir of dirs) {
      const g = resolve(this.cwd, dir);
      const paths = await glob(g);
      for (const path of paths) {
        const file = await getFile(resolve(this.cwd, dir), path);
        out.push(file);
      }
    }
    return out;
  }

  private async _write(files: Array<(IFile & T)>, dir: string | WriteFn<T>): Promise<void[]> {
    return Promise.all(files.map(async file => {
      if (typeof dir === 'function') {
        dir = await dir(file, files, this);
      }
      const path = resolve(this.cwd, dir, file.relativePath);
      return makeFile(path, file.contents);
    }));
  }

  /**
   * Path is optional - if you `.use()` a Barnes instance, its path will
   * default to the parent's path.
   */
  constructor(path?: string) {
    this.cwd = path;
  }
}
