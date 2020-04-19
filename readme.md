# array-keyed-map [![](https://img.shields.io/npm/v/array-keyed-map.svg?style=flat-square)](https://www.npmjs.com/package/array-keyed-map) [![](https://img.shields.io/travis/anko/array-keyed-map.svg?style=flat-square)](https://travis-ci.org/anko/array-keyed-map) [![](https://img.shields.io/coveralls/github/anko/array-keyed-map?style=flat-square)](https://coveralls.io/github/anko/array-keyed-map) [![](https://img.shields.io/david/anko/array-keyed-map?style=flat-square)](https://david-dm.org/anko/array-keyed-map)

A map which keys are Array "paths" of arbitrary values.  Uses the identity of
the objects in the key (like `Map` does with a single key); not some fragile
string-serialisation hack.

```js
const ArrayKeyedMap = require('array-keyed-map')
const m = new ArrayKeyedMap()

const obj = { x: true }
const objIdentical = { x: true }
const fun = function() {}
const reg = /regexp/

// Set values
m.set([obj],            1)
m.set([obj, fun],       2)
m.set([reg, reg, true], 3)
m.set([],               4)

// Get values
console.log( m.get([obj]) )            // => 1
console.log( m.get([objIdentical]) )   // => undefined
console.log( m.get([obj, fun]) )       // => 2
console.log( m.get([reg, reg, true]) ) // => 3
console.log( m.get([]) )               // => 4
```

Implements the same methods as `Map`, with the difference of *not remembering
insertion order when iterating entries later*.  Stores paths compactly as a
tree.

## API

### `new ArrayKeyedMap([iterable])`

**Arguments:**

 - (optional) `iterable`: any iterable value of `[key, value]` entries from
   which to initialise contents

**Returns** ArrayKeyedMap `akmap`.

Array keyed maps are iterable, so you can use them in `for`-loops, pass them to
`Array.from`, pass them into the constructor to create a copy (`let copy = new
ArrayKeyedMap(akmap)`), etc.  (See [`.entries`](#akmapentries).)

### `akmap.set(array, value)`

**Arguments:**

 - `array`: `Array` of values
 - `value`: any value

Sets the value for the given array.

Objects in the array are treated by identity.  The identity of the array object
itself is irrelevant.

**Returns** `undefined`.

### `akmap.has(array)`

**Arguments:**

 - `array`: `Array` of values

**Returns** a Boolean: whether a previously set value exists for that key array.

### `akmap.get(array)`

**Arguments:**

 - `array`: `Array` of values

**Returns** the previously assigned value for this array, or `undefined` otherwise.

### `akmap.delete(array)`

**Arguments:**

 - `array`: `Array` of values

Deletes the value at this exact array.  Does not affect other array, even if
they are prefixes or extensions of this one.  Remember to do this if you no
longer need a array: the keys and values are not automatically
garbage-collected, even if the objects used as keys go out of scope!

**Returns** `undefined`.

### `akmap.clear()`

Deletes all entries from `akmap`.

**Returns** `undefined`.

### `akmap.hasPrefix(array)`

**Arguments:**

 - `array`: `Array` of values

**Returns** a Boolean: whether the map has some key starting with values
matching the given array.

### `akmap.entries()`

**Returns** an iterator that yields `[key, value]` for every entry in `akmap`.

:warning: Note that these are in *arbitrary order; __not__ insertion order*!
This differs from the basic `Map`!

### `akmap.keys()`

**Returns** an iterator that yields the key part (type `Array`) of each entry
in `akmap`.

:warning: Note that these are in *arbitrary order; __not__ insertion order*!
This differs from the basic `Map`!

### `akmap.values()`

**Returns** an iterator that yields the value part of each entry in `akmap`.

:warning: Note that these are in *arbitrary order; __not__ insertion order*!
This differs from the basic `Map`!

### `akmap.forEach(callback[, thisArg])`

**Arguments**:

 - `callback`:  `Function` that will be called for each entry in `akmap`,
   passing the value, key, and map as arguments.
 - (optional) `thisArg`: `Object` passed to the `callback` as the value for
   `this`.

**Returns** `undefined`.

:warning: Note that these are in *arbitrary order; __not__ insertion order*!
This differs from the basic `Map`!

## Performance characteristics

`get`, `has`, `set`, and `delete` are all `O(n)` with key array length `n`.  I
believe this is optimal; O(1) would require the JS runtime to expose the
identity of all objects as hashable values, which is not currently possible.

Stores paths in a tree structure, to conserve memory when key arrays share a
prefix.  This means `entries`, `keys`, `values`, and `forEach` are `O(n)` with
`n` total length of all keys of all entries, only counting shared key-array
prefixes once.

`clear` is `O(1)`.

## FAQ

### Why is this better than `.join('/')`ing the keys and using a regular object?

 - Because your key array's elements might have `/`s in them.  For example, the
   arrays `['a/b']` and `['a', 'b']` would both resolve to the key `a/b`.

   So use something other than a `/`?  Sure, but then you have the same problem
   with elements possibly containing *that*.

   So use a sufficiently long probabilistically unguessable string like
   `03f2a8291a700b95904190583dba17c4ae1bf3bdfc2834391d60985ac6724940`?  That
   wastes RAM/disk when you have many long arrays.  And also what the heck are
   you doing, that's illegal.

 - Because even an empty `Object` [has built-in properties on
   it](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   (e.g. `length`, or `getOwnPropertyNames`), which your keys might
   accidentally overwrite, causing subtle bugs down the line.

 - Because you might want your key array to contain objects (by identity)
   rather than strings.  Objects are difficult or impossible to stringify (e.g.
   they may contain cyclic references), and even then two distinct objects with
   identical contents would stringify to the same value and cause subtle bugs.

### What version of JS does this rely on?

ES2015—it uses [`Map`](http://kangax.github.io/compat-table/es6/#test-Map)s and
[`Symbol`](http://kangax.github.io/compat-table/es6/#test-Symbol)s (← caniuse
links).  At time of writing, it works in any recent Node.js or browser.  Except
IE, of course.

## License

[ISC](https://opensource.org/licenses/isc).
