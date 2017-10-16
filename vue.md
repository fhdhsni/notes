From Sara Drasner `intro to Vue` workshop

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

## COMPUTED properties
(cached until dependency is changed)
Computed properties are calculations that will be cached and will only update when needed. Highly performant but use with understanding. They are the different view of the same data.

| computed                                            |      methods                                |
|-----------------------------------------------------|:-------------------------------------------:|
| Runs only when a dependency has changed             | Runs whenever an update occurs              |
| Cached                                              | Not cached                                  |
| Should be used as a property, in place of data      | Typically invoked from v-on/@, but flexible |
| By default getter only, but you can define a setter | Getter/setter                               |


## WATCHERs
For reactivity Vus.js uses a variation of `getters/setters`

Vue takes the object, walks through its properties and converts them to getter/setters
```js
new Vue({
  data: {
    text: 'msg'
  }
})

```
Vue cannot detect property addition or deletion so we create this object to keep track

Each component has a watcher instance. The properties touched by the watcher during the render are registered as 
dependencies. When the setter is triggered, it lets the watcher know, and causes the component to re-render.

The Vue instance is the middleman between the DOM and the business logic

example:
```html
<template>
  <div id="app">
    <input type="number" v-model.number="counter">
  </div>
</template>

<script>
export default {
  data () {
    return {
      counter: 0
    }
  },
  watch: {
    counter () {/* name must be the same as data */
      console.log('counter changed')
    }
  }
}
</script>
```

We also have access to the new value and the old value:

```js
watch: {
  watchedProperty (value, oldValue) {
    //your dope code here
  }
},
```

We can also gain access to nested values with 'deep':

```js
watch: {
  watchedProperty {
    deep: true,
    nestedWatchedProperty (value, oldValue) {
      //your dope code here
    }
  }
},
```
## TEMPLATE

Vue.js uses HTML-based template syntax to bind the Vue instance to the DOM, very useful for components.
Templates are optional, you can also write render functions with optional JSX support.

### props
Passing data down from the parent to the child. Props are intended for one way communication
You can think of it a little like the component holds a variable that is waiting to be filled out by whatever the parent sends down to it.

App.vue
```html
<template>
  <div>
    <hello :person="myname"></hello> <!-- person is a prop -->
  </div>
</template>

<script>
import Hello from "./components/Hello.vue"

export default {
  components: { Hello }, // also possible: components: { 'my-compo': Hello },
  data () {
    return {
      myname: 'farhad'
    }
  },
}
</script>
```

Hello.vue
```html
<template>
  <div>
    <p>{{ msg }} {{person}}</p> <!-- person is a `prop` -->
  </div>
</template>

<script>
export default {
  props: ["person"],
  data () {
    return {
      msg: 'hello'
    }
  }
}
</script>
```

`Props` can have types/validation/default,...

```js
<script>
export default {
  props: {
    person: {
      type: String,
      required: true,
      default: 'hello mr. magoo'
    }
  },

  data () {
    return {
      msg: 'hello'
    }
  }
}
</script>
```

Note: Objects and arrays need their defaults to be returned from a function: 
```js
text: {
  type: Object,
  default: function () {
    return { message: 'hello mr. magoo' }
  }
}
```

camelCasing will be converted
 
In HTML it will be kebab-case:
 ```js
  props: ['booleanValue']
```
```html
  <checkbox :boolean-value="booleanValue"></checkbox>
```

### x-template
Another way to define templates is inside of a script element with the type text/x-template, then referencing the template by an id. For example:

```js
Vue.component('individual-comment', {
  template: '#comment-template',
  props: ['commentpost']
})
```

```html
  <ul>
    <li
      is="individual-comment"
      v-for="comment in comments"
      v-bind:commentpost="comment"
    ></li>
  </ul>

  <!-- template -->
<script type="text/x-template" id="comment-template">
  <li> 
    <img class="post-img" :src="commentpost.authorImg" /> 
    <small>{{ commentpost.author }}</small>
    <p class="post-comment">"{{ commentpost.text }}"</p>
  </li>
</script>
```
### Events
```html
<my-component @myEvent="parentHandler($event)"></my-component>
```

```js
methods: {
  fireEvent() {
    this.$emit('myEvent', eventValueOne, eventValueTwo);
  }
}
```

### Slots
```html
<template>
    <slot>default text</slot>
</template>
```

When we have more than one slot we can name them
```html
<slot name="headerinfo"></slot>
<!-- to use it >> -->
<h1 slot="headerinfo">I will populate the headerinfo slot</h1>
```

### Keep Alive

If you want to keep the switched-out components in memory so that you can preserve their state or avoid re-rendering, you can wrap a dynamic component in a <keep-alive> element:
```html
<keep-alive>
  <component :is="currentView">
    <!-- inactive components will be cached! -->
  </component>
</keep-alive>
```

### lifecycle hooks
The lifecycle hooks provide you a method so that you might trigger something precisely at different junctures of a component's lifecycle. Components are mounted when we instantiate them, and in turn unmounted, for instance when we toggle them in a v-if/v-else statement.

* `beforeCreate`
* `created`
* `beforeMount`
* `mounted`
* `beforeUpdate`
* `updated`
* `activated`
* `deactivated`
* `beforeDestroy`
* `destroyed`

Lifecycle hooks also auto-bind to the instance so that you can use the component’s state, and methods. Again, you don't have to console.log to find out what this refers to!
 
 For this reason though, you shouldn’t use an arrow function on a lifecycle method, as it will return the parent instead of giving you nice binding out of the box.

 ### NUXT


 ### Animation
 [vue animation diagram]( https://s3.amazonaws.com/media-p.slid.es/uploads/75854/images/3639060/transition.png)

```html
<template>
  <transition name="fade">
    <app-child v-if="isShowing" class="modal">
      <button @click="toggleShow">
        Close
      </button>
    </app-child>
  </transition>
</template>
<!-- style >> -->
<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.25s ease-out;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
```
[example](https://codepen.io/sdras/pen/6ef951b970faf929d8580199fe8ea6ba) of using transition.

[example](https://codepen.io/sdras/pen/pRWxGg) of using CSS animation.

### Transition Modes
to specify an order

**IN-OUT**:
The current element waits until the new element is done transitioning in to fire
 
**OUT-IN**:
The current element transitions out and then the new element transitions in.

```html
<transition name="flip" mode="out-in">
  <slot v-if="!isShowing"></slot>
  <img v-else src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/28963/cartoonvideo14.jpeg" />
</transition>
```
[example](https://codepen.io/sdras/pen/mRpoOG)

#### JavaScript Hooks for Animation
```html
<transition 
  @before-enter="beforeEnter"
  @enter="enterEl"
  @after-enter="afterEnter"
  @enter-cancelled="enterCancelled"

  @before-leave="beforeLeave"
  @leave="leaveEl"
  @after-leave="afterLeave"
  @leave-cancelled="leaveCancelled"
  :css="false">
 
 </transition>

<script> 
  methods: {
     enterEl(el, done) {
       //entrance animation
       done();
    },
    leaveEl(el, done) {
      //exit animation
      done();
    },
  }
</script>
```
## Filters
The first thing to understand about filters is that they aren't replacements for methods, computed values, or watchers, because filters don't transform the data, just the output that the user sees.

```js
//global
Vue.filter('filterName', function(value) {
  return // thing to transform
});
 
//locally, like methods or computed
filters: {
  filterName(value) {
    return // thing to transform
  }
}
```
You can pass arguments:
```js
{{ data | filterName(arg1, arg2) }}
// arguments are passed in order after the value
filters: {
  filterName(value, arg1, arg2) {
    return //thing to transform
  }
}
```
Filters sounds like it would be good to filter a lot of data, but filters are rerun on every single update, so better to use computed, for values like these that should be cached

## MIXINS
It's a common situation: you have two components that are pretty similar, they share the same basic functionality, but there's enough that's different about each of them that you come to a crossroads: do I split this component into two different components? Or do I keep one component, but create enough variance with props that I can alter each one?

A mixin allows you to encapsulate one piece of functionality so that you can use it in different components throughout the application.

```html
<div id="app">
  <app-modal></app-modal>
  <hr />
  <app-tooltip></app-tooltip>
</div>

<script type="text/x-template" id="modal">
  <div>
    <h3>Let's trigger this here modal!</h3>
  	<button @click="toggleShow">
      <span v-if="isShowing">Hide child</span>
      <span v-else>Show child</span>
    </button>
  	<app-child v-if="isShowing" class="modal">
    	<button @click="toggleShow">Close</button>
  	</app-child>
  </div>
</script>
```

```js
const Child = {
  template: '#childarea'
};

const toggle = {/* common functionality between modal and  tooltip */
  data() {
    return {
      isShowing: false
    }
  },
  methods: {
    toggleShow() {
      this.isShowing = !this.isShowing;
    }
  }
}

const Modal = {
  template: '#modal',
  mixins: [toggle],
  components: {
    appChild: Child
  }
};

const Tooltip = {
  template: '#tooltip',
  mixins: [toggle],
  components: {
    appChild: Child
  }
};

new Vue({
  el: '#app',
  components: {
    appModal: Modal,
    appTooltip: Tooltip
  }
});
```
By default, mixins will be applied first, and the component will be applied second so that we can override it as necessary.
 
The component has the last say.

```js
//mixin
const hi = {
  mounted() {
    console.log('hello from mixin!')
  }
}

//vue instance or component
new Vue({
  el: '#app',
  mixins: [hi],
  mounted() {
    console.log('hello from Vue instance!')
  }
});

//Output in console
//> hello from mixin!
//> hello from Vue instance!
```

Another example that component overrides the mixin method.
```js
//mixin
const hi = {
  methods: {
    sayHello: function() {
      console.log('hello from mixin!')
    }
  },
  mounted() {
    this.sayHello()
  }
}

//vue instance or component
new Vue({
  el: '#app',
  mixins: [hi],
  methods: {
    sayHello: function() {
      console.log('hello from Vue instance!')
    }
  },
  mounted() {
    this.sayHello()
  }
})

// Output in console
//> hello from Vue instance!
//> hello from Vue instance!
```

## GLOBAL MIXINS

```js
Vue.mixin({
  mounted() {
    console.log('hello from mixin!')
  }
})

new Vue({
  ...
})

/* This console.log would now appear in every component */
```

Global mixins are literally applied to every single component. One use I can think of that makes sense is something like a plugin, where you may need to gain access to everything.
 
But still, the use case for them is extremely limited and they should be considered with great caution.


## Custom Directives
```html
<p v-tack>I will now be tacked onto the page</p>
```

```js
Vue.directive('tack', {
 bind(el, binding, vnode) {
    el.style.position = 'fixed'
  }
});
```

`v-example` - this will instantiate a directive, but doesn't accept any arguments. Without passing a value, this would not be very flexible, but you could still hang some piece of functionality off of the DOM element.

`v-example="value"` - this will pass a value into the directive, and the directive figures out what to do based off of that value.


`v-example:arg="value"` - this allows us to pass in an argument to the directive. In the example below, we're binding to a class, and we'd style it with an object, stored separately.
`v-example:arg.modifier="value"` - this allows us to use a modifier. The example below allows us to call `preventDefault()` on the click event.
 
`<button v-on:submit.prevent="onSubmit"></button>`

We have different hooks for binding like `v-bind`, `v-inserted`, `v-updated`, and [more](https://s3.amazonaws.com/media-p.slid.es/uploads/75854/images/3909041/custom-directives-flat.svg)

example
```html
  <div id="app">
    <p>Scroll down the page</p>
    <p v-tack="70">Stick me 70px from the top of the page</p>
  </div>
```

and its implementation 
```js
  Vue.directive('tack', {
    bind(el, binding, vnode) {
      el.style.position = 'fixed'
      el.style.top = binding.value + 'px'
    }
  });
```

**Pass an argument**

```html
<p v-tack:left="70">I'll now be offset from the left instead of the top</p>
```

```js
Vue.directive('tack', {
  bind(el, binding, vnode) {
    el.style.position = 'fixed';
    const s = (binding.arg == 'left' ? 'left' : 'top');
    el.style[s] = binding.value + 'px';
  }
});
```

**More than one value**

```html
<p v-tack="{ top: '40', left: '100' }">
  Stick me 40px from the top of the page and 100px from the left of the page
</p>
```

```js
Vue.directive('tack', {
  bind(el, binding, vnode) {
    el.style.position = 'fixed';
    el.style.top = binding.value.top + 'px';
    el.style.left = binding.value.left + 'px';
  }
}); 
```
2

A real example 

```js
Vue.directive('scroll', {
  inserted: function(el, binding) {
    let f = function(evt) {
      if (binding.value(evt, el)) {
        window.removeEventListener('scroll', f);
      }
    };
    window.addEventListener('scroll', f);
  },
});

// main app
new Vue({
  el: '#app',
  methods: {
   handleScroll: function(evt, el) {
    if (window.scrollY > 50) {
      TweenMax.to(el, 1.5, {
        y: -10,
        opacity: 1,
        ease: Sine.easeOut
      })
    }
    return window.scrollY > 100;
    }
  }
});
```

to use it 

```html
<div class="box" v-scroll="handleScroll">
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A atque amet harum aut ab veritatis earum porro praesentium ut corporis. Quasi provident dolorem officia iure fugiat, eius mollitia sequi quisquam.</p>
</div>
```

live [example](https://codepen.io/sdras/pen/5ca1e0c724d7d900603d8898b5551189)

## vuex

**WHAT** is it?
Centralized store for shared data and logic, even shared methods or async

**WHY** should we use it?
In a complex single page application, passing state between many components, and especially deeply nested or sibling components, can get complicated quickly. Having one centralized place to access your data can help you stay organized.


**HOW**?
The initial set up in `store.js` would look something like this 

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    key: value
  }
})
```

In our `main.js` file, we'd perform the following updates (updated lines highlighted):

```js
import Vue from 'vue';
import App from './App.vue';

import { store } from './store/store';/* added line */

new Vue({
  el: '#app',
  store, /* added line */
  template: '<App/>',
  components: { App }
});
```

**Getters**: will make values able to show statically in our templates. In other words, getters can read the value, but not mutate the state.

**Mutations** will allow us to update the state, but they will always be *synchronous*. Mutations are the only way to change data in the state in the store.

**Actions** will allow us to update the state, *asynchronously*, but will use an existing mutation. This can be very helpful if you need to perform a few different mutations at once in a particular order, or reach out to a server.


Basic Abstract Example

```js
export const store = new Vuex.Store({
  state: {
    counter: 0
  },
  //showing things, not mutating state
  getters: {
    tripleCounter: state => {
      return state.counter * 3;
    }
  },
  //mutating the state
  //mutations are always synchronous
  mutations: {
    //showing passed with payload, represented as num
    increment: (state, num) => {
      state.counter += num;
    }
  }, 
  //commits the mutation, it's asynchronous
  actions: {
    // showing passed with payload, represented as asynchNum (an object)
    asyncIncrement: ({ commit }, asyncNum) => {
      setTimeout(() => {
        //the asyncNum objects could also just be static amounts
        commit('increment', asyncNum.by);
      }, asyncNum.duration);
    }
  }
})
```

To actually use it in our component
```html
<template>
  <div>
    <button @click="increment">increment</button>
    <button @click="incrementImmediately">increment immediately</button>
    <br> {{getValue}}
  </div>
</template>

<script>
export default {
    
  methods: {
    increment () {
      return this.$store.dispatch('asyncIncrement', {
        by: 99,
        duration: 1000,
      })
    },
    incrementImmediately () {
      this.$store.commit('increment', 88)
    }
  },
  computed: {
    getValue () {
      return this.$store.state.counter;
    },
    value() {
      return this.$store.getters.tripleCounter;/* using getters */
    }
  }
}
</script>
```

On the component itself, we would use `computed` for `getters` (this makes sense because the value is already computed for us), and `methods` with `commit` to access the `mutations`, and methods with `dispatch` for the `actions`:


