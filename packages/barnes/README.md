# Barnes

Barnes is a plugin-based build tool. It's a kind of like Metalsmith, just more
so. It allows you to easily generate and manipulate lists of things with the
array methods you know and love (`.map()`, `.filter()` and `.reduce()`, along
with `.series()` and other made-up ones).

```javascript
import Barnes from 'barnes';
import pandoc from 'barnes-pandoc';
import preact from 'barnes-preact';
import markdown from 'barnes-markdown';
import reader from 'reading-time';

import layout from './layout';
import toHTML from './toHTML';

const assign = ::Object.assign;

export default async function tex(dir) {
  return new Barnes(dir)
    // read from glob
    .read('**/*.tex')
    // set out dir metadata
    .set('meta', { dir: 'tex' })
    // filter out files starting with dots
    .filter(doc => doc.path.startsWith('.'))
    // convert each doc to commonmark with pandoc
    .map(pandoc('commonmark'))
    // add layout component to each doc
    .map(doc => assign(doc, { layout }))
    // add reading time to each doc
    .map(doc => assign(doc, reader(doc.contents))
    // turn contents to HTML
    .map(markdown())
    // render layout component with preact
    .map(preact())
    // wrap string into HTML document
    .map(toHTML())
}

tex('/Users/dev/Documents/TeX')
  // write to public directory
  .write(app => app.meta.get('out'))
  // execute
  .then(() => console.log('done!');
```

With a robust collection of input/output methods, you can use a variety
of data inputs and outputs. `.from()` and `.to()` allow you to pull and push
data via async functions. `.fetch()` allows you to make HTTP requests to pull
or push data. `.read()` and `.write()` read all files from a directory and
write files to a directory.

- `.map()` allows you to perform the same operation on each item in the list
- `.filter()` allows you to filter items from the list based on a predicate
  function
- `.reduce()` allows you to accumulate files into an arbitrary variable -
  especially useful for summing a collection's size or read time, or collapsing
  and expanding arrays into larger or smaller ones
- `.series()` operates much like map, but will wait for preceeding operations
  to terminate before continuing onto the next

Barnes is distributed with a handful of plugins for some common use-cases.
`barnes-pandoc` allows users to perform conversion operations on files, while
`barnes-preact` allows users to render docs into HTML with the Preact library.

Writing your own Barnes plugin is straightforward. Most plugins are `map`
plugins - they take each item and transform it into another one. This can be as
simple as adding another metadata field or as complex as transforming markdown
to HTML. Let's write an example plugin to add a `hot` boolean to files with >=
25 comments over the last 24 hours.

```javascript
export default function hot() {
  return async function hot(file, files, barnes) {
    const yesterday = new Date(Date.now() - 8.64e+7);
    const comments = file.comments
      .filter(c => new Date(c.created) >= yesterday);
    return Object.assign(file, { hot: comments.length >= 25 });
  }
}
```

## Chaining
With `.use()`, you can also use Barnes instances as sources for other Barnes
instances. This is great for static site generators.

```javascript
import Barnes from 'barnes';
import brsync from 'barnes-rsync';
import lyrics from './lyrics';
import blog from './blog';

const assign = ::Object.assign;
const rsync = brsync('/var/www/mysite.com/public');

new Barnes('/Users/dev')
  // load barnes instances / factories
  .use(lyrics)
  .use(blog)
  // assign metadata to barnes instances
  .map(app => assign(app, app.meta.get('meta') ))
  // write each instance to disk
  .to(app => app.write(app.dir))
  // rsync to remote directory
  .to(app => rsync(app.dir))
  // execute
  .then(() => console.log('Done!'));
```