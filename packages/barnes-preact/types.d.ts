declare module 'barnes-preact' {
  import Barnes, { MapFn } from 'barnes';
  import { ComponentConstructor } from 'preact';

  interface IContented {
    contents: string;
  }

  interface IQueriedComponentConstructor<T> extends ComponentConstructor<any, any> {
    query(file: T, files: T[], barnes: Barnes<T>): Promise<any>;
  }

  interface ILayouted<T> extends IContented {
    layout: string | IQueriedComponentConstructor<T>;
  }

  export default function preact(): <T extends ILayouted<T>>(file: T, files: T[], barnes: Barnes<T>) => Promise<T>;
}