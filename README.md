# JSONBuilder
Build JSON files into static HTML

## Example

```js
// create new JSONBuilder object and set it render on document.body
const renderer = new JSONBuilder({
    attachTo: document.body
});

// create basic page
const _page = {
  tag: 'div',
  attributes: [{ name: 'style', value: 'color: blue;' }],
  classes: ['class1', 'class2', 'class3  class4'],
  children: [
    {
      tag: 'p',
      id: 'my-paragraph',
      children: ['Basic paragraph element']
    }
  ]
}

// mount our JSON code
renderer.mount(_page)
```

## Elements

- `tag`: the HTML tag to be used, defaults to `jsb-element`
- `attributes`:  each attributes to be applied to the element `[{ name: '', value: ''}, ...]`
- `classes`: an array of each class to be applied to the element
- `children`: an array of elements defined in a similar style
- `id`: the ID to apply to the element

### Special Properties

- `import`: (syntax: `{ import: [_other_code_here_usually_from_another_file_] }`) used to embed code from other files in page
- `read`: (syntax: `{ read: [_atom_code_from_other_file_] }`) used to read "atoms" (or small template elements defined by using only the `atom` property in an exported JSON object)

```js
// other file
export const btn_primary = {
    atom: {
        tag: 'btn1',
        classes: ['btn_primary']
    }
}

// page file
import { btn_primary } from './other_file.js';

export default {
  tag: 'div',
  children: [
    { read: [btn_primary] } 
  ]
}
```

## Notes

Licensed under the `MIT` license. See [./LICENSE](https://github.com/oxvs/JSONBuilder/blob/main/LICENSE) for more information.
