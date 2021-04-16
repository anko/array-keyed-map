/*
  # Implementation strategy

  Create a tree of `Map`s, such that indexing the tree recursively (with items
  of a key array, sequentially), traverses the tree, so that when the key array
  is exhausted, the tree node we arrive at contains the value for that key
  array under the guaranteed-unique `Symbol` key `dataSymbol`.

  ## Example

  Start with an empty `ArrayKeyedMap` tree:

      {
      }

  Add ['a'] → 1:

      {
        'a': {
          [dataSymbol]: 1,
        },
      }

  Add [] → 0:

      {
        [dataSymbol]: 0,
        'a': {
          [dataSymbol]: 1,
        },
      }

  Add ['a', 'b', 'c', 'd'] → 4:

      {
        [dataSymbol]: 0,
        'a': {
          [dataSymbol]: 1,
          'b': {
            'c': {
              'd': {
                [dataSymbol]: 4,
              },
            },
          },
        },
      }

  String array keys are used in the above example for simplicity.  In reality,
  we can support any values in array keys, because `Map`s do.
*/

const dataSymbol = Symbol('path-store-trunk')

//
// This class represents the external API
//

class ArrayKeyedMap {
  constructor (initialEntries = []) {
    this._root = new Map()
    this._size = 0
    for (const [k, v] of initialEntries) { this.set(k, v) }
  }

  set (path, value) { return set.call(this, path, value) }

  has (path) { return has.call(this, path) }

  get (path) { return get.call(this, path) }

  delete (path) { return del.call(this, path) }

  get size () { return this._size }

  clear () {
    this._root.clear()
    this._size = 0
  }

  hasPrefix (path) { return hasPrefix(path, this._root, this) }

  get [Symbol.toStringTag] () { return 'ArrayKeyedMap' }

  * [Symbol.iterator] () { yield * entries([], this._root) }

  * entries () { yield * entries([], this._root) }

  * keys () { yield * keys(this._root) }

  * values () { yield * values(this._root) }

  forEach (callback, thisArg) { forEach(this._root, callback, thisArg, this) }
}

module.exports = ArrayKeyedMap

//
// These stateless functions implement the internals
//

function set (path, value) {
  let map = this._root
  for (const item of path) {
    let nextMap = map.get(item)
    if (!nextMap) {
      // Create next map if none exists
      nextMap = new Map()
      map.set(item, nextMap)
    }
    map = nextMap
  }

  // Reached end of path.  Set the data symbol to the given value, and
  // increment size if nothing was here before.
  if (!map.has(dataSymbol)) this._size += 1
  map.set(dataSymbol, value)
  return this
}

function has (path) {
  let map = this._root
  for (const item of path) {
    const nextMap = map.get(item)
    if (nextMap) {
      map = nextMap
    } else {
      return false
    }
  }
  return map.has(dataSymbol)
}

function get (path) {
  let map = this._root
  for (const item of path) {
    map = map.get(item)
    if (!map) return undefined
  }
  return map.get(dataSymbol)
}

function del (path) {
  let map = this._root

  // Maintain a stack of maps we visited, so we can go back and trim empty ones
  // if we delete something.
  const stack = []

  for (const item of path) {
    const nextMap = map.get(item)
    if (nextMap) {
      stack.unshift({ parent: map, child: nextMap, item })
      map = nextMap
    } else {
      // Nothing to delete
      return false
    }
  }

  // Reached end of path.  Delete data, if it exists.
  const hadPreviousValue = map.delete(dataSymbol)

  // If something was deleted, decrement size and go through the stack of
  // visited maps, trimming any that are now empty.
  if (hadPreviousValue) {
    this._size -= 1

    for (const { parent, child, item } of stack) {
      if (child.size === 0) {
        parent.delete(item)
      }
    }
  }
  return hadPreviousValue
}

const hasPrefix = (path, store) => {
  switch (path.length) {
    case 0:
      return true
    default: {
      const [next, ...rest] = path
      const nextStore = store.get(next)
      return nextStore ? hasPrefix(rest, nextStore) : false
    }
  }
}

const entries = function * (path, store) {
  for (const [key, value] of store) {
    if (key === dataSymbol) yield [path, value]
    else {
      yield * entries(path.concat([key]), value)
    }
  }
}

const keys = function * (store) {
  for (const [k] of entries([], store)) yield k
}

const values = function * (store) {
  for (const [, v] of entries([], store)) yield v
}

const forEach = (store, callback, thisArg, main) => {
  for (const [k, v] of entries([], store)) callback.call(thisArg, v, k, main)
}
