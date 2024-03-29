# Barnes-Consolidate
Make HTML files with just about any templating language!

## Prerequisites
You'll need to install the appropriate template language package, write
your templates in that format, and specify a `layout` field on records you'd
like to render.

## Installation
```bash
yarn add barnes-consolidate
```

## Usage
```javascript
import Barnes from 'barnes';
import consolidate from 'barnes-consolidate';
import * as nunjucks from 'nunjucks';

(async () => {
  await new Barnes('/Users/Dev/Documents')
    .read('**/*.md')
    // assign 'template' property to each file
    .map(file => Object.assign(file, { template: 'file.njk' }))
    // convert layout'd files to HTML - using custom key 'template'
    // (defaults to 'layout')
    .map(consolidate({ engine: 'nunjucks', key: 'template' })
    // all layout'd files are now HTML!
    .write('public');
}());
```