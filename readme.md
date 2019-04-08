# array-keyed-map [![](https://img.shields.io/npm/v/array-keyed-map.svg?style=flat-square)](https://www.npmjs.com/package/array-keyed-map) [![](https://img.shields.io/travis/anko/array-keyed-map.svg?style=flat-square)](https://travis-ci.org/anko/array-keyed-map)

A map where the keys are arrays of arbitrary values.  Works with any JavaScript
value.  Uses the actual identity of the key values, not some fragile
string-serialisation hack.

## Example

```js
const m = arrayKeyedMap()

m.set(['a', 'b'],       1)
m.set(['a', 'b', true], 2)
m.set(['a', ''],        3)
m.set(['a'],            4)

m.get(['a', 'b'])       => 1
m.get(['a', 'b', true]) => 2
m.get(['a', ''])        => 3
m.get(['a'])            => 4
```

You can use arbitrary JavaScript values as array elements and as values.  Array
elements are treated by identity, like `Map` does.

## API

Construct an array-keyed map object:

```
const arrayKeyedMap = require('array-keyed-map')
const akmap = arrayKeyedMap()
```

The constructor takes no arguments.

### `akmap.set(array, value)`

**Arguments:**

 - `array`: `Array` of values
 - `value`: any value

Sets the value for the given array.

Objects in the array are treated by identity.  The identity of the array object
itself is irrelevant.

**Returns** `undefined`.

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

## FAQ

### Why is this better than `.join('/')`ing the keys and using a regular object?

 - Because your array elements might have `/`s in them.  For example, the array
   `['a/b']` and `['a', 'b']` would both resolve to the array `a/b`.

   So use something other than a `/`?  Sure, but then you have the same problem
   with elements possibly containing *that*.

   So use a sufficiently long unguessable string like
   `03f2a8291a700b95904190583dba17c4ae1bf3bdfc2834391d60985ac6724940`?  That
   that wastes RAM/disk when you have many long arrays.

 - Because even an empty `Object` [has properties on
   it](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
   (e.g. `length`), your stored keys might accidentally overwrite, causing
   subtle bugs.

 - Because you might want your array to contain objects rather than strings,
   and objects are inefficient to stringify, frequently even impossible.

### What version of JS does this rely on?

ES2015—it uses [`Map`](http://kangax.github.io/compat-table/es6/#test-Map)s and
[`Symbol`](http://kangax.github.io/compat-table/es6/#test-Symbol)s (← caniuse
links).  At time of writing, it works in any recent Node.js or browser.  Except
IE, of course.

### Does this implement the full `Map` API?

No.  I'd take a PR though! :stars:

## License

[ISC](https://opensource.org/licenses/isc).
