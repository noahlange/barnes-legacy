declare module 'barnes' {
  import { Response } from 'node-fetch';

  interface IHasPathAndContents {
    relativePath: string;
    contents: any;
  }

  export default class Barnes<T> {
    public files: T[];
    public cwd: string;
    public length: number;
    public meta: Map<any, any>;

    public set(key: any, value: any): Barnes<T>;

    public use<O>(callback: Barnes<O>): Barnes<T & Barnes<O>>
    public fetch<O>(callback: FetchFn): Barnes<T & O>;
    public from<O>(callback: FromFn<O>): Barnes<T & O>;
    public read(dir: string | string[]): Barnes<T & IFile>;
    
    public to(callback: ToFn<T>): this;
    public write(callback: string | WriteFn<T>): this;
    public log(callback?: RenderFn<T>): this;

    public then(callback?: () => Promise<any> | any): Promise<any> | any;
    public catch(callback?: () => Promise<any> | any): Promise<any> | any;

    public map<O>(callback: MapFn<T, O>): Barnes<O>;
    public reduce<O>(callback: ReduceFn<T, O[]>, initialValue?: O[]): Barnes<O>;
    public reduce<O>(callback: ReduceFn<T, O>, initial?: O): Barnes<O>;
    public series<O>(callback: SeriesFn<T, O>): Barnes<O>;
    public filter(callback: FilterFn<T>): this;
    public sort(callback: SortFn<T>): this;

    constructor(cwd?: string);
  }

  export enum CALLBACK {
    BARNES,
    MAP,
    SERIES,
    REDUCE,
    FILTER,
    FROM,
    TO,
    READ,
    WRITE,
    LOG
  }

  export type MapFn<I, O> = (file: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
  export type SeriesFn<I, O> = (file: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
  export type FilterFn<I> = (file: I, files: I[], barnes: Barnes<I>) => Promise<boolean> | boolean;
  export type ReduceFn<I, O> = (prev: O, curr: I, files: I[], barnes: Barnes<I>) => Promise<O> | O;
  export type RenderFn<I> = (file: I, files: I[], barnes: Barnes<I>) => Promise<string> | string;
  export type FromFn<O> = () => Promise<O[]> | O[];
  export type ToFn<O> = (file: O, files: O[], barnes: Barnes<O>) => Promise<any> | any;
  export type FetchFn = () => Promise<Response>;
  export type WriteFn<O> = (file: O, files: O[], barnes: Barnes<O>) => Promise<string> | string;
  export type SortFn<I> = (fileA: I, fileB: I, files: I[], barnes: Barnes<I>) => Promise<1 | -1>;

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
    [key: string]: any;
  }

  interface ICallbackRecord {
    callback?: any;
    data?: any;
    type: CALLBACK;
  }
}