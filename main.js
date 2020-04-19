const dataSymbol = Symbol('path-store-trunk')

// We keep a tree that represents potential paths through the object.  Each
// tree node is a Map with a Symbol key that corresponds to the value stored at
// the path terminating at this node.  All the other keys refer to further
// nodes in the path.  The data key being a symbol ensures the user-provided
// keys cannot collide with it.

const construct = (initialEntries = []) => {
  const rootStore = new Map()
  let size = 0

  const set = (path, value, store = rootStore) => {
    switch (path.length) {
      case 0:
        if (!store.has(dataSymbol)) size += 1
        store.set(dataSymbol, value)
        break
      default: {
        const [next, ...rest] = path
        let nextStore = store.get(next)
        if (!nextStore) {
          nextStore = new Map()
          store.set(next, nextStore)
        }
        set(rest, value, nextStore)
        break
      }
    }
  }

  const has = (path, store = rootStore) => {
    switch (path.length) {
      case 0:
        return store.has(dataSymbol)
      default: {
        const [next, ...rest] = path
        const nextStore = store.get(next)
        if (nextStore) {
          return has(rest, nextStore)
        } else {
          return false
        }
      }
    }
  }

  const get = (path, store = rootStore) => {
    switch (path.length) {
      case 0:
        return store.get(dataSymbol)
      default: {
        const [next, ...rest] = path
        const nextStore = store.get(next)
        return nextStore ? get(rest, nextStore) : undefined
      }
    }
  }

  const del = (path, store = rootStore) => {
    switch (path.length) {
      case 0:
        store.delete(dataSymbol)
        size -= 1
        break
      default: {
        const [next, ...rest] = path
        const nextStore = store.get(next)
        // Since the path is longer than 0, there must be a next store
        del(rest, nextStore)
        // If the next store is now empty, prune it
        if (!nextStore.size) {
          store.delete(next)
        }
        break
      }
    }
  }

  const clear = () => {
    rootStore.clear()
    size = 0
  }

  const hasPrefix = (path, store = rootStore) => {
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

  const entries = function * (path = [], store = rootStore) {
    for (const [key, value] of store) {
      if (key === dataSymbol) yield [path, value]
      else {
        yield * entries(path.concat([key]), value)
      }
    }
  }

  const keys = function * () {
    for (const [k] of entries()) yield k
  }

  const values = function * () {
    for (const [, v] of entries()) yield v
  }

  const forEach = (callback, thisArg) => {
    for (const [k, v] of entries()) callback.call(thisArg, v, k, store)
  }

  const store = {
    // Query and modification
    set,
    has,
    get,
    delete: del,
    clear,
    hasPrefix,

    // Iterators
    entries,
    [Symbol.iterator]: entries,
    keys,
    values,
    forEach,

    // Meta
    constructor: construct,
    get [Symbol.toStringTag] () { return 'ArrayKeyedMap' }
  }
  Object.defineProperty(store, 'size', { get: () => size })

  for (const [k, v] of initialEntries) { store.set(k, v) }

  return store
}

module.exports = construct
