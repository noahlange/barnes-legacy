import { Response } from 'node-fetch';
import Barnes from './Barnes';

export type EachFn<I, O extends I> = (file: I, files: I[], barnes: Barnes<I>) => file is O;
export type MapFn<I, O> = (file: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
export type SeriesFn<I, O> = (file: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
export type FilterFn<I> = (file: I, files: I[], barnes: Barnes<I>) => Promise<boolean> | boolean;
export type ReduceFn<I, O> = (prev: O, curr: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
export type RenderFn<I> = (file: I, files: I[], barnes: Barnes<I>) => Promise<string> | string;
export type FromFn<O> = () => Promise<O[]> | O[];
export type ToFn<O> = (file: O, files: O[], barnes: Barnes<O>) => Promise<any> | any;
export type FetchFn = () => Promise<Response>;
export type WriteFn<O> = (file: O, files: O[], barnes: Barnes<O>) => Promise<string> | string;
export type UseFn<O> = ((dir: string) => Promise<Barnes<O>> | Barnes<O>) | Barnes<O>;
export type SortFn<I> = (fileA: I, fileB: I, files: I[], barnes: Barnes<I>) => Promise<1 | -1>;

export interface IHistoryish {
  history: any[];
}

export interface IFile {
  path: string;
  extension: string;
  relativePath: string;
  contents: string;
  history: any[];
  size: number;
  modifiedTime: string;
  accessTime: string;
  changeTime: string;
  birthTime: string;
  md5: string;
}

export interface ICallbackRecord {
  callback?: any;
  data?: any;
  type: CALLBACK;
}

export enum CALLBACK {
  BARNES,
  SET,
  MAP,
  SERIES,
  REDUCE,
  FILTER,
  FETCH,
  SORT,
  FROM,
  TO,
  READ,
  WRITE,
  EACH,
  LOG
}
