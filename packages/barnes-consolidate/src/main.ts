import Barnes from 'barnes';
import * as cons from 'consolidate';
import { resolve } from 'path';

interface IContented {
  contents: string;
}

interface ILayouted<T> extends IContented {
  layout: string;
}

interface IConsolidateOptions {
  engine?: string;
  layouts?: string;
  key?: string;
}

export default function consolidate(options?: IConsolidateOptions) {
  options = Object.assign({ engine: 'handlebars', key: 'layout', layouts: 'layouts' }, options);
  return async function consolidate<T extends ILayouted<T>>(file: T, files: T[], barnes: Barnes<T>): Promise<T> {
    const path = resolve(barnes.cwd, options.layouts, file[options.key]);
    const contents = await cons[options.engine](path, { file, files, barnes }) as string;
    return Object.assign(file, { contents });
  };
}
