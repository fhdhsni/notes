
## DIRECTIVES
HTML attributes, that basically attaches some functionality to that HTML markup.
- `v-text`: &nbsp; Similar to using mustache templates
- `v-html`: &nbsp; for strings that have html elements that need to be rendered!
- `v-show`: it uses `display: none`
- `v-if`: completely takes the element out of  `DOM`
- `v-else`
- `v-else-if`
- `v-for`
- `@` or `v-on`: &nbsp; for binding to events like click and mouseenter

Multiple binding is also possible 
```html
<div v-on="
  click   : onClick,
  keyup   : onKeyup,
  keydown : onKeydown
">
</div>
<!-- same as -->
<div @="
  click   : onClick,
  keyup   : onKeyup,
  keydown : onKeydown
">
</div>
```
### MODIFIERs
    - `@mousemove.stop` is comparable to e.stopPropogation()
    - `@mousemove.prevent` this is like e.preventDefault()
    - `@submit.prevent` this will no longer reload the page on submission
    - `@click.once` not to be confused with v-once, this click event will be triggered once.
    - `@click.native` so that you can listen to native events (not virtual-dom events) in the DOM

- `:` or `v-bind`: &nbsp; 
          We can use it for so many things- class and style binding, creating dynamic props, etc...

cool example:           
```html   
<template>
  <div>
    <input type="text" v-model="name">
    <p :style="{ color: `${name}`}">sample text</p>
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: ''
    }
  }
}
</script>
```
- `v-model`: 
            Creates a relationship between the data in the instance/component and a form input, so you can dynamically update values
- `v-pre`: &nbsp; skip the mustache, that is to say literally print `{{ stuff }}`
- `v-cloak`
- `v-once`

### MODIFIERS
`v-model.trim`: will strip any leading or trailing whitespace from the bound string
`v-model.number` changes strings to number inputs
`v-model.lazy` won’t populate the content automatically, it will wait to bind until an event happens. (It listens to change events instead of input)