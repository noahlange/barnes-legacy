![logo](logo.png)

Barnes is a build tool. Also a static site generator. But it's also composable,
and has weirdly powerful support for generics. Anything you can get as a list,
you can manipulate with Barnes using a straightforward API and a powerful set
of familiar methods, as well as plugins for many common build tasks.

```javascript
import Barnes from 'barnes';
import pandoc from 'barnes-pandoc';
import preact from 'barnes-preact';
import mkdown from 'barnes-markdown';
import reader from 'reading-time';

import layout from './layout';
import toHTML from './toHTML';

(async function main() {
  await new Barnes('/Users/Dev/Documents')
    // read from glob
    .read('**/*')
    // filter out non-TeX files (should do this via glob)
    .filter(file => file.path.endsWith('.tex'))
    // convert each doc to commonmark with pandoc
    .map(pandoc({ 'latex': 'commonmark' })
    // add layout component and reading time to each doc
    .map(file => Object.assign(file, { layout }, reader(doc.contents))
    // turn contents to HTML
    .map(mkdown())
    // render layout component with preact
    .map(preact())
    // wrap string into HTML document
    .map(toHTML())
    // write to public directory
    .write('public')
})();