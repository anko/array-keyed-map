let dataSymbol = Symbol('path-store-trunk')

// We keep a tree that represents potential paths through the object.  Each
// tree node is a Map with a Symbol key that corresponds to the value stored at
// the path terminating at this node.  All the other keys refer to further
// nodes in the path.  The data key being a symbol ensures the user-provided
// keys cannot collide with it.

let pathStore = () => {

  let rootStore = new Map()
  let size = 0

  let set = (path, value, store=rootStore) => {

    switch (path.length) {
      case 0:
        if (!store.has(dataSymbol)) size += 1
        store.set(dataSymbol, value)
        break
      default:
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

  let has = (path, store=rootStore) => {

    switch (path.length) {
      case 0:
        return store.has(dataSymbol)
        break
      default:
        const [next, ...rest] = path
        let nextStore = store.get(next)
        if (nextStore) {
          return has(rest, nextStore)
        } else {
          return false
        }
        break
    }
  }

  let get = (path, store=rootStore) => {

    switch (path.length) {
      case 0:
        return store.get(dataSymbol)
        break
      default:
        const [next, ...rest] = path
        let nextStore = store.get(next)
        if (nextStore) {
          return get(rest, nextStore)
        } else {
          return undefined
        }
        break
    }
  }

  let del = (path, store=rootStore) => {

    switch (path.length) {
      case 0:
        store.delete(dataSymbol)
        size -= 1
        break
      default:
        const [next, ...rest] = path
        let nextStore = store.get(next)
        if (nextStore) {
          del(rest, nextStore)
          // If the next store is now empty, prune it
          if (!nextStore.size) {
            store.delete(next)
          }
        }
        break
    }
  }

  let entries = function* (path=[], store=rootStore) {

    for (const [key, value] of store) {
      if (key === dataSymbol) yield [path, value]
      else {
        yield* entries(path.concat([key]), value)
      }
    }
  }

  let keys = function* () {
    for (const [k, v] of entries()) yield k
  }

  let values = function* () {
    for (const [k, v] of entries()) yield v
  }

  let store = { set, has, get, delete:del,
    entries,
    [Symbol.iterator]: entries,
    keys,
    values,
  }
  Object.defineProperty(store, 'size', { get: () => size })
  return store
}

module.exports = pathStore
