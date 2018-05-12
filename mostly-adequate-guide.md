- A pure function is a function that, given the same input, will always return the same output and does not have any observable side effect

- A side effect is a change of system state or observable interaction with the outside world that occurs during the calculation of a result.

- pure functions can always be cached by input. This is typically done using a technique called memoization:

```js
const memoize = (f) => {
  const cache = {};

  return (...args) => {
    const argStr = JSON.stringify(args);
    cache[argStr] = cache[argStr] || f(...args);
    return cache[argStr];
  };
};

const squareNumber = memoize(x => x * x);

squareNumber(4); // 16

squareNumber(4); // 16, returns cache for input 4

squareNumber(5); // 25

squareNumber(5); // 25, returns cache for input 5
```
## Functional Husbandry

Here's compose:

```js
const compose = (f, g) => x => f(g(x));
```
f and g are functions and x is the value being "piped" through them.


```js
// compose :: ((a -> b), (b -> c),  ..., (y -> z)) -> a -> z
function compose(...fns) {
  const n = fns.length;

  return function $compose(...args) {
    let $args = args;

    for (let i = n - 1; i >= 0; i -= 1) {
      $args = [fns[i].call(null, ...$args)];
    }

    return $args[0];
  };
}
```

## Pointfree
 It means functions that never mention the data upon which they operate.
 ```js
 // not pointfree because we mention the data: word
const snakeCase = word => word.toLowerCase().replace(/\s+/ig, '_');

// pointfree
const snakeCase = compose(replace(/\s+/ig, '_'), toLowerCase);
 ```

See how we partially applied replace? What we're doing is piping our data
through each function of 1 argument. Currying allows us to prepare each
function to just take its data, operate on it, and pass it along. Something
else to notice is how we don't need the data to construct our function in the
pointfree version, whereas in the pointful one, we must have our word
available before anything else.

```js
// not pointfree because we mention the data: name
const initials = name => name.split(' ').map(compose(toUpperCase, head)).join('. ');

// pointfree
const initials2 = compose(join('. '), map(compose(toUpperCase, head)), split(' '));

initials('hunter stockton thompson'); // 'H. S. T'
```

### A COMMON MISTAKE

A common mistake is to compose something like map, a function of two
arguments, without first partially applying it.

```js
const latin = compose(map, angry, reverse);

latin(['frog', 'eyes']); // error

// right - each function expects 1 argument.
const latin = compose(map(angry), reverse);

latin(['frog', 'eyes']); // ['EYES!', 'FROG!'])
```



In category theory, we have something called... a category. It is defined as a collection with the following
components:

A collection of objects
A collection of morphisms
A notion of composition on the morphisms
A distinguished morphism called identity

There is a law regarding map and composition:
```js
// map's composition law
compose(map(f), map(g)) === map(compose(f, g));
```

# Hindley-Milner

```js
// reduce :: (b -> a -> b) -> b -> [a] -> b
const reduce = curry((f, x, xs) => xs.reduce(f, x));
```

## Narrowing the Possibility

`// reverse :: [a] -> [a]`

From the type signature alone, what could reverse possibly be up to? Again, it
cannot do anything specific to a. It cannot change a to a different type or
we'd introduce a b. Can it sort? Well, no, it wouldn't have enough
information to sort every possible type. Can it re-arrange? Yes, I suppose it
can do that, but it has to do so in exactly the same predictable way. Another
possibility is that it may decide to remove or duplicate an element. In any
case, the point is, the possible behaviour is massively narrowed by its
polymorphic type.

## Free as in Theorem
Besides deducing implementation possibilities, this sort of reasoning gains us
free theorems. What follows are a few random example theorems lifted directly
from Wadler's paper on the subject.
```js
// head :: [a] -> a
compose(f, head) === compose(head, map(f));

// filter :: (a -> Bool) -> [a] -> [a]
compose(map(f), filter(compose(p, f))) === compose(filter(p), map(f));
```
You don't need any code to get these theorems, they follow directly from the
types. The first one says that if we get the head of our array, then run some
function f on it, that is equivalent to, and incidentally, much faster than,
if we first map(f) over every element then take the head of the result.


## Constraints
One last thing to note is that we can constrain types to an interface.

```js
// sort :: Ord a => [a] -> [a]
```
What we see on the left side of our fat arrow here is the statement of a fact: a must be an Ord. Or in other words, a must implement the Ord interface.

another example
```
// map :: Functor f => (a -> b) -> f a -> f b
```
given a function and functor `f a` it returns functor `f b`

# Tupperware
```js
class Container {
  constructor(x) {
    this.$value = x;
  }

  static of(x) {
    return new Container(x);
  }
}
```

> A Functor is a type that implements map and obeys some laws

```js
// (a -> b) -> Container a -> Container b
Container.prototype.map = function (f) {
  return Container.of(f(this.$value));
};
```


```js
class Maybe {
  static of(x) {
    return new Maybe(x);
  }

  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  constructor(x) {
    this.$value = x;
  }

  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }

  inspect() {
    return this.isNothing ? 'Nothing' : `Just(${inspect(this.$value)})`;
  }
}
```
Our `map` function can still work because Mabye is a Functor
```js
// map :: Functor f => (a -> b) -> f a -> f b
const map = curry((f, anyFunctor) => anyFunctor.map(f));
```


### use case for `Maybe`

we'll typically see `Maybe` used in functions which might fail to return a result.

```js
// safeHead :: [a] -> Maybe(a)
const safeHead = xs => Maybe.of(xs[0]);


// note that because safeHead returns a Functor we use map after that
// streetName :: Object -> Maybe String
const streetName = compose(map(prop('street')), safeHead, prop('addresses'));

streetName({ addresses: [] });
// Nothing

streetName({ addresses: [{ street: 'Shady Ln.', number: 4201 }] });
// Just('Shady Ln.')
```

## Releasing the Value
To pull a value out of the worm womb of our `Maybe` functor

```js
// maybe :: b -> (a -> b) -> Maybe a -> b
const maybe = curry((v, f, m) => {
  if (m.isNothing) {
    return v;
  }

  return f(m.$value);
});

// getTwenty :: Account -> String
const getTwenty = compose(maybe('You\'re broke!', finishTransaction), withdraw(20)); // withdraw returns a Maybe functor, we get the inner value with maybe and also providing a default if it was Nothing

getTwenty({ balance: 200.00 }); 
// 'Your balance is $180.00'

getTwenty({ balance: 10.00 }); 
// 'You\'re broke!'
```
We will now either return a static value (of the same type that
finishTransaction returns) or continue on merrily finishing up the
transaction sans Maybe. With maybe, we are witnessing the equivalent of an
`if/else` statement whereas with map, the imperative analog would be: `if (x !== null) { return f(x) }`.

## Pure Error Handling

```js
class Either {
  static of(x) {
    return new Right(x);
  }

  constructor(x) {
    this.$value = x;
  }
}

class Left extends Either {
  map(f) {
    return this;
  }

  inspect() {
    return `Left(${inspect(this.$value)})`;
  }
}

class Right extends Either {
  map(f) {
    return Either.of(f(this.$value));
  }

  inspect() {
    return `Right(${inspect(this.$value)})`;
  }
}

const left = x => new Left(x);

// Left is the teenagery sort and ignores our request to map over it. Right will
// work just like Container (a.k.a Identity). The power comes from the ability
// to embed an error message within the Left.

const moment = require('moment');

// Something to notice is that we return Either(String, Number), which holds a
// String as its left value and a Number as its Right
// getAge :: Date -> User -> Either(String, Number) 
const getAge = curry((now, user) => {
  const birthDate = moment(user.birthDate, 'YYYY-MM-DD');

  return birthDate.isValid()
    ? Either.of(now.diff(birthDate, 'years'))
    : left('Birth date could not be parsed'); // embedding an error message, we can still use map, left will ignore it
});

getAge(moment(), { birthDate: '2005-12-12' });
// Right(9)

getAge(moment(), { birthDate: 'July 4, 2001' });
// Left('Birth date could not be parsed')
```

```js
// fortune :: Number -> String
const fortune = compose(concat('If you survive, you will be '), toString, add(1));

// zoltar :: User -> Either(String, _)
const zoltar = compose(map(console.log), map(fortune), getAge(moment()));

zoltar({ birthDate: '2005-12-12' });
// 'If you survive, you will be 10'
// Right(undefined)

zoltar({ birthDate: 'balloons!' });
// Left('Birth date could not be parsed')
```

`fortune` despite its use with Either in this example, is completely ignorant of any
functors milling about. This was also the case with finishTransaction in the
previous example. At the time of calling, __a function can be surrounded by
map, which transforms it from a non-functory function to a functory one__, in
informal terms. We call this process lifting. Functions tend to be better off
working with normal data types rather than container types, then lifted into
the right container as deemed necessary. This leads to simpler, more reusable
functions that can be altered to work with any functor on demand.


## little either

Just like with `Maybe`, we have little either, which behaves similarly, but
takes two functions instead of one and a static value. Each function should
return the same type:

```js
// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = curry((f, g, e) => {
  let result;

  switch (e.constructor) {
    case Left:
      result = f(e.$value);
      break;

    case Right:
      result = g(e.$value);
      break;

    // No Default
  }

  return result;
});

// zoltar :: User -> _
const zoltar = compose(console.log, either(id, fortune), getAge(moment()));

zoltar({ birthDate: '2005-12-12' });
// 'If you survive, you will be 10'
// undefined

zoltar({ birthDate: 'balloons!' });
// 'Birth date could not be parsed'
// undefined
```
## Old McDonald Had Effects...
```js
// getFromStorage :: String -> (_ -> String)
const getFromStorage = key => () => localStorage[key];
```

Had we not surrounded its guts in another function, `getFromStorage` would vary
its output depending on external circumstance. With the sturdy wrapper in
place, we will always get the same output per input: a function that, when
called, will retrieve a particular item from localStorage. And just like that
we've cleared our conscience and all is forgiven.

```js
class IO {
  static of(x) {
    return new IO(() => x);
  }

  constructor(io) {
    this.unsafePerformIO = io;
  }

  map(fn) {
    return new IO(compose(fn, this.unsafePerformIO));
  }

  inspect() {
    return `IO(${inspect(this.unsafePerfomIo)})`;
  }
}
```

`IO` differs from the previous functors in that the `unsafePerformIo` is always a function.
We don't think of its `$value` as a function, however - that is an
implementation detail and we best ignore it. What is happening is exactly
what we saw with the `getFromStorage` example: __`IO` delays the impure action by
capturing it in a function wrapper__. As such, we think of `IO` as containing the
return value of the wrapped action and not the wrapper itself. This is
apparent in the of function: we have an `IO(x)`, the `IO(() => x)` is just
necessary to avoid evaluation. Note that, to simplify reading, we'll show the
hypothetical value contained in the IO as result; however in practice, you
can't tell what this value is until you've actually unleashed the effects!

### example
```js
// ioWindow :: IO Window
const ioWindow = new IO(() => window);

ioWindow.map(win => win.innerWidth);
// IO(1430)

ioWindow
  .map(prop('location'))
  .map(prop('href'))
  .map(split('/'));
// IO(['http:', '', 'localhost:8000', 'blog', 'posts'])


// $ :: String -> IO [DOM]
const $ = selector => new IO(() => document.querySelectorAll(selector)); // returns an IO after it's called

$('#myDiv').map(head).map(div => div.innerHTML);
// IO('I am some inner html')
```
## Asynchronous Tasks

Like IO, Task will patiently wait for us to give it the green light before
running. In fact, because it waits for our command, IO is effectively
subsumed by Task for all things asynchronous; readFile and getJSON don't
require an extra IO container to be pure. What's more, Task works in a
similar fashion when we map over it: we're placing instructions for the
future like a chore chart in a time capsule - an act of sophisticated
technological procrastination.

```js
var Task = require('data.task')
var fs = require('fs')

// read : String -> Task(Error, Buffer)
function read(path) {
  return new Task(function(reject, resolve) {
    fs.readFile(path, function(error, data) {
      if (error)  reject(error)
      else        resolve(data)
    })
  })
}
```

## A Spot of Theory

functors come from category theory and satisfy a few laws.

```js
// identity
map(id) === id;

// composition
compose(map(f), map(g)) === map(compose(f, g));

```

Example for composition

```js
const compLaw1 = compose(map(concat(' world')), map(concat(' cruel')));
const compLaw2 = map(compose(concat(' world'), concat(' cruel')));

compLaw1(Container.of('Goodbye')); // Container(' world cruelGoodbye')
compLaw2(Container.of('Goodbye')); // Container(' world cruelGoodbye')
```

In category theory, functors take the objects and morphisms of a category and
map them to a different category. By definition, this new category must have
an identity and the ability to compose morphisms, but we needn't check
because the aforementioned laws ensure these are preserved.

You can think of a category as a network of objects with morphisms that
connect them. So a functor would map the one category to the other without
breaking the network. If an object a is in our source category C, when we map
it to category D with functor F, we refer to that object as F a

For instance, Maybe maps our category of types and functions to a category
where each object may not exist and each morphism has a null check. We
accomplish this in code by surrounding each function with map and each type
with our functor. We know that each of our normal types and functions will
continue to compose in this new world. Te

```
a ------- f ------- b
|                   |
|                   |
F.of               F.of
|                   |
|                   |
F a --- map(f) --- F b
```

```js
// topRoute :: String -> Maybe String
const topRoute = compose(Maybe.of, reverse);

// bottomRoute :: String -> Maybe String
const bottomRoute = compose(map(reverse), Maybe.of);

topRoute('hi'); // Just('ih')
bottomRoute('hi'); // Just('ih')
```

### Functors can stack:

```js
const nested = Task.of([Either.of('pillows'), left('no sleep for you')]);

map(map(map(toUpperCase)), nested); // first map for Task, second map for array and the third map for Eithers
// Task([Right('PILLOWS'), Left('no sleep for you')])
```

We can instead compose functors. 

```js
class Compose {
  constructor(fgx) {
    this.getCompose = fgx;
  }

  static of(fgx) {
    return new Compose(fgx);
  }

  map(fn) {
    return new Compose(map(map(fn), this.getCompose));
  }
}

const tmd = Task.of(Maybe.of(', rock on, Chicago'));

const ctmd = Compose.of(tmd);

map(concat('Rock over London'), ctmd);
// Compose(Task(Just('Rock over London, rock on, Chicago')))

ctmd.getCompose;
// Task(Just('Rock over London, rock on, Chicago'))
```
# Monadic Onions 

> A pointed functor is a functor with an of method

```js
IO.of('tetris').map(concat(' master'));
// IO('tetris master')

Maybe.of(1336).map(add(1));
// Maybe(1337)

Task.of([{ id: 2 }, { id: 3 }]).map(map(prop('id')));
// Task([2,3])

Either.of('The past, present and future walk into a bar...').map(concat('it was tense.'));
// Right('The past, present and future walk into a bar...it was tense.')
```

## Mixing Metaphors

monads are like onions
```js
const fs = require('fs');

// readFile :: String -> IO String
const readFile = filename => new IO(() => fs.readFileSync(filename, 'utf-8'));

// print :: String -> IO String
const print = x => new IO(() => {
  console.log(x);
  return x;
});

// cat :: String -> IO (IO String)
const cat = compose(map(print), readFile);

cat('.git/config');
// IO(IO('[core]\nrepositoryformatversion = 0\n'))
```


Another example
```js
// safeProp :: Key -> {Key: a} -> Maybe a
const safeProp = curry((x, obj) => Maybe.of(obj[x]));

// safeHead :: [a] -> Maybe a
const safeHead = safeProp(0);

// firstAddressStreet :: User -> Maybe (Maybe (Maybe Street))
const firstAddressStreet = compose(
  map(map(safeProp('street'))),
  map(safeHead),
  safeProp('addresses'),
);

firstAddressStreet({
  addresses: [{ street: { name: 'Mulburry', number: 8402 }, postcode: 'WC2N' }],
});
// Maybe(Maybe(Maybe({name: 'Mulburry', number: 8402})))
```
### join

```js
Maybe.prototype.join = function join() {
  return this.isNothing() ? Maybe.of(null) : this.$value;
};
```

```js
const mmo = Maybe.of(Maybe.of('nunchucks'));
// Maybe(Maybe('nunchucks'))

mmo.join();
// Maybe('nunchucks')

const ioio = IO.of(IO.of('pizza'));
// IO(IO('pizza'))

ioio.join();
// IO('pizza')

const ttt = Task.of(Task.of(Task.of('sewers')));
// Task(Task(Task('sewers')));

ttt.join();
// Task(Task('sewers'))
```
> Monads are pointed functors that can flatten


Any functor which defines a `join` method, has an `of` method, and obeys a few
laws is a monad.


```js

// join :: Monad m => m (m a) -> m a
const join = mma => mma.join();

// firstAddressStreet :: User -> Maybe Street
const firstAddressStreet = compose(
  join,
  map(safeProp('street')),
  join,
  map(safeHead), safeProp('addresses'),
);

firstAddressStreet({
  addresses: [{ street: { name: 'Mulburry', number: 8402 }, postcode: 'WC2N' }],
});
// Maybe({name: 'Mulburry', number: 8402})

```
### chain

You might have noticed a pattern. We often end up calling join right after a map. Let's abstract this into a function called chain.

```js
// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = curry((f, m) => m.map(f).join());

// or

// chain :: Monad m => (a -> m b) -> m a -> m b
const chain = f => compose(join, map(f));


const firstAddressStreet = compose(
  chain(safeProp('street')),
  chain(safeHead),
  safeProp('addresses'),
);
```

### Theory

1. associativity

```js
compose(join, map(join)) === compose(join, join);
```
```
M(M(M a))------map(join)-----M(M a)
|                              |
|                              |
|                              |
join                           join
|                              |
|                              |
|                              |
M(M a)---------join----------M a

``` 

2. identity for all (M a)

```js
compose(join, of) === compose(join, map(of)) === id;
```

# Applicative Functors


the ability to apply functors to each other.

`ap` is a function that can apply the function contents of one functor to the
 value contents of another.


```js
Container.of(add(2)).ap(Container.of(3));
// Container(5)

// all together now

Container.of(2).map(add).ap(Container.of(3));
// Container(5)
``` 

```js
Container.prototype.ap = function (otherContainer) {
  return otherContainer.map(this.$value);
};
```

Remember, `this.$value` will be a function and we'll be accepting another
functor so we need only `map` it. And with that we have our interface
definition:

>An applicative functor is a pointed functor with an ap method


```js
F.of(x).map(f) === F.of(f).ap(F.of(x));
```

In proper English, mapping `f` is equivalent to `ap`ing a functor of `f`. Or in
properer English, we can place `x` into our container and `map(f)` OR we can lift
both `f` and `x` into our container and `ap` them. This allows us to write in a
left-to-right fashion:


```js
Maybe.of(add).ap(Maybe.of(2)).ap(Maybe.of(3));
// Maybe(5)

Task.of(add).ap(Task.of(2)).ap(Task.of(3));
// Task(5)

```
### Coordination Motivation

```js
// Http.get :: String -> Task Error HTML

const renderPage = curry((destinations, events) => { /* render page */ });

Task.of(renderPage).ap(Http.get('/destinations')).ap(Http.get('/events'));
// Task("<div>some page with dest and events</div>")

```
Again, because we're using partial application to achieve this result,

Another example
```js
// $ :: String -> IO DOM
const $ = selector => new IO(() => document.querySelector(selector));

// getVal :: String -> IO String
const getVal = compose(map(prop('value')), $);

// signIn :: String -> String -> Bool -> User
const signIn = curry((username, password, rememberMe) => { /* signing in */ });

IO.of(signIn).ap(getVal('#email')).ap(getVal('#password')).ap(IO.of(false));
// IO({ id: 3, email: 'gg@allin.com' })
```

Another example 
```js
// checkEmail :: User -> Either String Email
// checkName :: User -> Either String String

const user = {
  name: 'John Doe',
  email: 'blurp_blurp',
};

//  createUser :: Email -> String -> IO User
const createUser = curry((email, name) => { /* creating... */ });

Either.of(createUser).ap(checkEmail(user)).ap(checkName(user));
// Left('invalid email')

liftA2(createUser, checkEmail(user), checkName(user));
// Left('invalid email')
```
### Laws

```js
// identity
A.of(id).ap(v) === v;

```

```js
// homomorphism
A.of(f).ap(A.of(x)) === A.of(f(x));

/* example */
Either.of(toUpperCase).ap(Either.of('oreos')) === Either.of(toUpperCase('oreos'));
```

```js
// interchange
v.ap(A.of(x)) === A.of(f => f(x)).ap(v);

/* example */
const v = Task.of(reverse);
const x = 'Sparklehorse';

v.ap(Task.of(x)) === Task.of(f => f(x)).ap(v);
```


```js
// composition
A.of(compose).ap(u).ap(v).ap(w) === u.ap(v.ap(w));

/* example */
const u = IO.of(toUpperCase);
const v = IO.of(concat('& beyond'));
const w = IO.of('blood bath ');

IO.of(compose).ap(u).ap(v).ap(w) === u.ap(v.ap(w));
```

# Transform Again, Naturally

A Natural Transformation is a "morphism between functors", that is, a
function which operates on the containers themselves. Typewise, it is a
function `(Functor f, Functor g) => f a -> g a`.

```
F a --------- map(f) --------- F b
|                               |
|                               |
|                               |
nt                              nt
|                               |
|                               |
|                               |
G a --------- map(f) --------- G b
```

```js
// nt :: (Functor f, Functor g) => f a -> g a
compose(map(f), nt) === compose(nt, map(f));
```

Some example

```js
Let's look at some of these as examples:

// idToMaybe :: Identity a -> Maybe a
const idToMaybe = x => Maybe.of(x.$value);

// idToIO :: Identity a -> IO a
const idToIO = x => IO.of(x.$value);

// eitherToTask :: Either a b -> Task a b
const eitherToTask = either(Task.rejected, Task.of);

// ioToTask :: IO a -> Task () a
const ioToTask = x => new Task((reject, resolve) => resolve(x.unsafePerform()));

// maybeToTask :: Maybe a -> Task () a
const maybeToTask = x => (x.isNothing ? Task.rejected() : Task.of(x.$value));

// arrayToMaybe :: [a] -> Maybe a
const arrayToMaybe = x => Maybe.of(x[0])
```

We're just changing one functor to another. We are permitted to lose
information along the way so long as the value we'll `map` doesn't get lost in
the shape shift shuffle. That is the whole point: `map` must carry on,
according to our definition, even after the transformation.

One way to look at it is that we are transforming our effects. In that light,
we can view `ioToTask` as converting synchronous to asynchronous or
`arrayToMaybe` from nondeterminism to possible failure. Note that we cannot
convert asynchronous to synchronous in JavaScript so we cannot write `taskToIO`
- that would be a supernatural transformation.


Another example:

Suppose we'd like to use some features from another type like sortBy on a
List. Natural transformations provide a nice way to convert to the target
type knowing our map will be sound.
```js
// arrayToList :: [a] -> List a
const arrayToList = List.of;

const doListyThings = compose(sortBy(h), filter(g), arrayToList, map(f));
const doListyThings_ = compose(sortBy(h), filter(g), map(f), arrayToList); // law applied
```
### Isomorphic JavaScript

When we can completely go back and forth without losing any information, that
is considered an isomorphism. That's just a fancy word for "holds the same
data". We say that two types are isomorphic if we can provide the "to" and
"from" natural transformations as proof:

```js
// promiseToTask :: Promise a b -> Task a b
const promiseToTask = x => new Task((reject, resolve) => x.then(resolve).catch(reject));

// taskToPromise :: Task a b -> Promise a b
const taskToPromise = x => new Promise((resolve, reject) => x.fork(reject, resolve));

const x = Promise.resolve('ring');
taskToPromise(promiseToTask(x)) === x;

const y = Task.of('rabbit');
promiseToTask(taskToPromise(y)) === y;
```

example:
without natural transformation
```js
// getValue :: Selector -> Task Error (Maybe String)
// postComment :: String -> Task Error Comment
// validate :: String -> Either ValidationError String

// saveComment :: () -> Task Error (Maybe (Either ValidationError (Task Error Comment)))
const saveComment = compose(
  map(map(map(postComment))),
  map(map(validate)),
  getValue('#comment'),
);
```

with natural transformation
```js
// getValue :: Selector -> Task Error (Maybe String)
// postComment :: String -> Task Error Comment
// validate :: String -> Either ValidationError String

// saveComment :: () -> Task Error Comment
const saveComment = compose(
  chain(postComment),
  chain(eitherToTask),
  map(validate),
  chain(maybeToTask),
  getValue('#comment'),
);
```

# Traversing the Stone

```js
// readFile :: FileName -> Task Error String

// firstWords :: String -> String
const firstWords = compose(join(' '), take(3), split(' '));

// tldr :: FileName -> Task Error String
const tldr = compose(map(firstWords), readFile);

map(tldr, ['file1', 'file2']);
// [Task('hail the monarchy'), Task('smash the patriarchy')]
```

The Traversable interface consists of two glorious functions: sequence and
traverse.

```js
// sequence :: (Traversable t, Applicative f) => (a -> f a) -> t (f a) -> f (t a)
const sequence = curry((of, x) => x.sequence(of));
```

Let's start with the second argument. It must be a Traversable holding an
Applicative. It is the `t (f a)` which gets turned into a `f (t a)`.

```js
class Right extends Either {
  // ...
  sequence(of) {
    return this.$value.map(Either.of);
  }
}
```

### Effect Assortment

If I have `[Maybe a]`, that's a collection of possible values whereas if I
have a `Maybe [a]`, that's a possible collection of values. The former
indicates we'll be forgiving and keep "the good ones", while the latter
means it's an "all or nothing" type of situation. Likewise, `Either Error (Task Error a)`
could represent a client side validation and `Task Error (Either Error a)`
could be a server side one.


### No Law and Order
