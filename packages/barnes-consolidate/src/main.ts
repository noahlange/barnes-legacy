import Barnes from 'barnes';
import * as cons from 'consolidate';

interface IContented {
  contents: string;
}

interface ILayouted<T> extends IContented {
  layout: string;
}

interface IConsolidateOptions {
  engine: string;
}

export default function consolidate(options?: IConsolidateOptions) {
  return async function consolidate<T extends ILayouted<T>>(file: T, files: T[], barnes: Barnes<T>): Promise<T> {
    const contents = await cons[options.engine || 'nunjucks'](file.layout, { file, files, barnes }) as string;
    return Object.assign(file, { contents });
  };
}
