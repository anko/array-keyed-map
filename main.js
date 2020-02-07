let trunkSymbol = Symbol('path-store-trunk')

// We keep a tree that represents potential paths through the object.  Each
// tree node is a Map with a Symbol key that corresponds to the value stored at
// the path terminating at this node.  All the other keys refer to further
// nodes in the path.

let pathStore = () => {

  let rootStore = new Map()
  let size = 0

  let set = (path, value, store) => {
    store = store || rootStore

    switch (path.length) {
      case 0:
        if (!store.has(trunkSymbol)) size += 1
        store.set(trunkSymbol, value)
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

  let has = (path, store) => {
    store = store || rootStore

    switch (path.length) {
      case 0:
        return store.has(trunkSymbol)
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

  let get = (path, store) => {
    store = store || rootStore

    switch (path.length) {
      case 0:
        return store.get(trunkSymbol)
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

  let del = (path, store) => {
    store = store || rootStore

    switch (path.length) {
      case 0:
        store.delete(trunkSymbol)
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

  let store = { set, has, get, delete:del }
  Object.defineProperty(store, 'size', { get: () => size })
  return store
}

module.exports = pathStore
