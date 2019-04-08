let trunkSymbol = Symbol('path-store-trunk')

// We keep a tree that represents potential paths through the object.  Each
// tree node is a Map with a Symbol key that corresponds to the value stored at
// the path terminating at this node.  All the other keys refer to further
// nodes in the path.

let pathStore = () => {

  let rootStore = new Map()

  let set = (path, value, store) => {
    store = store || rootStore

    switch (path.length) {
      case 0:
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
        //console.log('store now size', store.size)
        break
      default:
        const [next, ...rest] = path
        let nextStore = store.get(next)
        if (nextStore) {
          del(rest, nextStore)
          if (!nextStore.size) {
            store.delete(next)
            //console.log('deleting store at', next)
          }
        }
        break
    }
  }

  return { set, get, delete:del }
}

module.exports = pathStore
