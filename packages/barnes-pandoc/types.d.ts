declare module 'barnes-pandoc' {
  import Barnes, { MapFn } from 'barnes';

  /**
   * Something like a file - needs contents, an extension, an absolute path and
   * a relativePath.
   */
  interface IFileish {
    contents: string;
    extension: string;
    path: string;
    relativePath: string;
  }

  /**
   * A hash of format -> format. Files in keyed formats will be transformed into
   * the formats of their values.
   * ```javascript
   * {
   *   latex: 'commonmark',
   *   rst: 'commonmark',
   *   commonmark: 'html'
   * }
   * ```
   */
  interface IPandocOpts {
    [key: string]: string;
  }

  export default function pandoc(opts: IPandocOpts): MapFn<IFileish, IFileish>
}