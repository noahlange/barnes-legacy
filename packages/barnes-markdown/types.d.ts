declare module 'barnes-markdown' {

  import { MapFn } from 'barnes';

  interface IFileish {
    contents: string;
    path: string;
    relativePath: string;
  }

  export default function markdown(opts): MapFn<IFileish, IFileish>;
}