declare module 'barnes-preact' {
  import Barnes, { MapFn } from 'barnes';
  import { ComponentConstructor } from 'preact';
  
  type QueryFn<T> = (file: T, files: T[], barnes: Barnes<T>) => Promise<any>;

  interface IPreactOptions<T> {
    component?: string | ComponentConstructor<any, any>;
    key?: string;
    layouts?: string;
    query?: QueryFn<T>
  }

  interface ILayouted {
    contents: string;
    layout: string | ComponentConstructor<any, any>;
  }

  export default function preact<T extends ILayouted>(options?: IPreactOptions<T>): MapFn<T, T & ILayouted>;
}