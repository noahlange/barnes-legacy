# Barnes-Pandoc

Convert (nearly) anything into (nearly) anything else, through the power of
Pandoc!

## Prerequisites
You'll need a functioning Pandoc install. Go to [pandoc.org](http://pandoc.org)
and find the installation instructions for your platform.

## Installation
```bash
yarn add barnes-pandoc
```

## Usage
```javascript
import Barnes from 'barnes';
import pandoc from 'barnes-pandoc';

(async () => {
  await new Barnes('/Users/Dev/Documents')
    .read('**/*.*')
    // convert everything we can to markdown!
    .map(pandoc({ '*': 'commonmark' }))
    // all convertable files are now markdown!
    .write('md');
}());
```