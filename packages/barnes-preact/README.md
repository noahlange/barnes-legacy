# Barnes-Preact
Render your files into strings with Preact components!

## Prerequisites
You'll need to have some Preact components lying around - this can be either
imported and passed directly as a `layout` property or as a string, to be
required by the plugin.

## Installation
```bash
yarn add barnes-preact
```

## Usage
```javascript
import Barnes from 'barnes';
import preact from 'barnes-preact';

// pass an optional (can be async) function; its result will be passed as the
// component's data prop.
import query from './query';
// pass an optional default component
import component from './default-component';

(async () => {
  await new Barnes('/Users/Dev/Documents')
    .read('**/*.md')
    // assign layout property to each file
    .map(file => Object.assign(file, { layout }))
    // convert layout'd files to HTML
    .map(preact({ component, query }))
    // all layout'd files are now HTML (fragments, you'll need to wrap them
    // accordingly)
    .write('public');
}());
```