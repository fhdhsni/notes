- Angualr uses dirty checking. It intercepts events like clicks to perform a digest cycle then it checks all the things that it might have changed;

- Vue converts all the properties to getters and setters. for example `state.a`, `a` is a getter and setter.

- In Vue context, when we first render a Vue app, we first compile the template to a render function

Initial Render
Template
-> (compiled into) Render Function
-> (returns) Virtual DOM
-> (generates) Actual DOM

Render Function is a function that returns virtual DOM;
If any dependency changes render function will be called again.

Both JSX and template are a way of declaring a relationship between the DOM and our state. Template is just a more static, a more constraining form of expression. JSX is more dynamic; 


```js
export default {
  render (h) { /* h stands for hyperScript */
    return h('div', {}, [...] )
    /* 
    h(name, dataObj, moreChildNodes) 
    dataObj is something like 
    {
      props,
      attrs
      domprops,
      class,
      style,
    }
    examples
    h('div', 'some text')
    h('div', {class: 'foo'}, 'some text')
    h('div', {...}, ['some text', h('span', 'bar')])
    */
  }
}
```

The way to let vue know that it should make something reactive is by returning it within `data`;