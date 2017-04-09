import Barnes from 'barnes';
import { resolve } from 'path';
import { ComponentConstructor, h } from 'preact';
import * as render from 'preact-render-to-string';

function requireDefault(mod) {
  const m = require(mod);
  return m && m.default || m;
}

interface IPreactOptions<T> {
  component?: string | ComponentConstructor<any, any>;
  key?: string;
  layouts?: string;
  query?: QueryFn<T>;
}

interface ILayouted {
  layout: string | ComponentConstructor<any, any>;
  contents: string;
}

type QueryFn<T> = (file: T, files: T[], barnes: Barnes<T>) => Promise<any>;

export default function preact<T extends ILayouted>(options?: IPreactOptions<T>) {
  options = Object.assign({ key: 'layout', layouts: 'layouts' }, options);
  return async function preact(file: T, files: T[], barnes: Barnes<T>): Promise<T & ILayouted> {
    let Component = file[options.key] || options.component;
    if (typeof Component === 'string') {
      const path = resolve(barnes.cwd, options.layouts, file[options.key]);
      Component = requireDefault(path) as ComponentConstructor<any, any>;
    }
    const data = options.query ? options.query(file, files, barnes) : null;
    const contents = render(h(Component, { data, file, files, barnes }));
    return Object.assign(file, { contents });
  };
}
