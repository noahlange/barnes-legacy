declare module 'barnes-preact' {
  import Barnes, { MapFn } from 'barnes';

  interface IContented {
    contents: string;
  }

  interface ILayouted<T> extends IContented {
    layout: string;
  }

  interface IConsolidateOptions {
    layouts?: string;
    engine?: string;
  }

  export default function consolidate(options?: IConsolidateOptions): MapFn<IContented, IContented>;
}