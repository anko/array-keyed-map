const test = require('tape')
const akm = require('./main.js')

test('empty', (t) => {
  const p = akm()
  t.ok('function' === typeof p.set, 'set is a function')
  t.ok('function' === typeof p.get, 'get is a function')
  t.same(
    p.get(['a', 'b']),
    undefined,
    'getting path gives undefined')
  t.end()
})

test('set/get path len 0', (t) => {
  const p = akm()
  p.set([], true)
  t.same(p.get([]), true)
  t.end()
})


test('set/get path len 1', (t) => {
  const p = akm()
  p.set(['a'], true)
  t.same(p.get(['a']), true)
  t.end()
})

test('set/get path len 2', (t) => {
  const p = akm()
  p.set(['a', 'b'], true)
  t.same(p.get(['a', 'b']), true)
  t.end()
})

test('empty strings are ok', (t) => {
  const p = akm()
  p.set(['', ''], true)
  t.same(p.get(['']), undefined)
  t.same(p.get(['', '']), true)
  t.end()
})


test('any objects work as keys or values', (t) => {

  const objects = [
    new Map(),
    new WeakMap(),
    new Set(),
    {},
    ['a'],
    Symbol('test'),
    Math.PI,
    'hello world',
    false,
    0,
    () => {},
  ]

  const p = akm()
  const str = (x) => Object.prototype.toString.call(x).slice(8, -1)

  // Try all combinations of two things from the pool of objects as array elements, and values
  objects.forEach((k1) => {
    objects.forEach((k2) => {
      objects.forEach((value) => {
        p.set([k1, k2], value)
        t.same(
          p.get([k1, k2]),
          value,
          `[${str(k1)}, ${str(k2)}] => ${str(value)}`)
      })
    })
  })

  // Try all of them as length-1 paths
  objects.forEach((k) => {
    objects.forEach((value) => {
      p.set([k], value)
      t.same(
        p.get([k]),
        value,
        `[${str(k)}] => ${str(value)}`)
    })
  })

  // The last values set to the length-2 paths should all still be set
  const shouldBeValue = objects[objects.length - 1]
  objects.forEach((k1) => {
    objects.forEach((k2) => {
      t.same(
        p.get([k1, k2]),
        shouldBeValue,
        `[${str(k1)}, ${str(k2)}] => still ${str(shouldBeValue)}`)
    })
  })

  t.end()
})

test('set and delete empty path', (t) => {
  const p = akm()

  p.set([], true)

  p.delete([])
  t.same(p.get([]), undefined)
  p.set([], true) // Shouldn't throw
  t.end()
})

test('delete longer paths', (t) => {
  const p = akm()

  const paths = [
    [],
    ['a'],
    ['a', 'b'],
    ['a', 'b', 'c'],
  ]

  paths.forEach((path) => {
    p.set(path, true)
    p.delete(path)
    t.same(p.get(path), undefined,
      `${JSON.stringify(path)} can be deleted`)
  })

  t.end()
})

test(`deleting longer paths doesn't affect prefixes`, (t) => {
  const p = akm()

  p.set(['a', 'b'], 'ab')
  p.set(['a'], 'a')

  p.delete(['a', 'b'])
  t.same(p.get(['a']), 'a')

  t.end()
})

test(`deleting shorter paths doesn't affect longer continuations`, (t) => {
  const p = akm()

  p.set(['a', 'b'], 'ab')
  p.set(['a'], 'a')

  p.delete(['a'])
  t.same(p.get(['a', 'b']), 'ab')

  t.end()
})

test(`has`, (t) => {
  const p = akm()

  p.set(['a', 'b'], 'ab')

  t.same(p.has(['a', 'b']), true)
  t.same(p.has(['a']), false)

  p.set(['a'], 'a')
  t.same(p.has(['a']), true)

  t.end()
})

test('size', (t) => {
  const p = akm()

  p.set(['a', 'b', 'c'], 'abc')
  t.same(p.size, 1)

  p.set(['a'], 'a')
  t.same(p.size, 2)

  p.set(['a', 'd'], 'ad')
  t.same(p.size, 3)

  p.delete(['a'])
  t.same(p.size, 2)

  p.size = 0
  t.same(p.size, 2)

  t.end()
})

test('iterators', (t) => {
  const p = akm()

  const key1 = []
  const value1 = 'empty path'
  p.set(key1, value1)

  const key2 = ['b']
  const value2 = 'b'
  p.set(key2, value2)

  const key3 = ['a']
  const value3 = 'a'
  p.set(key3, value3)

  const key4 = ['b', 'a']
  const value4 = 'ba'
  p.set(key4, value4)

  // Note that entries 3 and 4 come in the opposite order in every iterator.
  // This is OK, because this module doesn't guarantee iteration order.
  test('entries', (t) => {
    const iterator = p.entries()
    t.same(iterator.next().value, [key1, value1])
    t.same(iterator.next().value, [key2, value2])
    t.same(iterator.next().value, [key4, value4])
    t.same(iterator.next().value, [key3, value3])
    t.end()
  })

  test('@@iterator', (t) => {
    const a = Array.from(p)
    t.same(a[0], [key1, value1])
    t.same(a[1], [key2, value2])
    t.same(a[2], [key4, value4])
    t.same(a[3], [key3, value3])
    t.end()
  })

  t.end()
})
