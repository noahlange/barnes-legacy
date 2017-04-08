# Barnes-Markdown
Convert CommonMark Markdown to HTML with the MarkdownIt library.

## Installation
```bash
yarn add barnes-markdown
```

## Usage
```javascript
import Barnes from 'barnes';
import mkdown from 'barnes-markdown';

// optionally pass an options object or MarkdownIt instance
import { opts, markdown } from './config';

(async () => {
  await new Barnes('/Users/Dev/Documents')
    .read('**/*.md')
    // convert to markdown 
    .map(mkdown(opts, markdown))
    // all markdown files are now html
    .write('public');
}());
```