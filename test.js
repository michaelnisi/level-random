'use strict'

const fs = require('fs')
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('./')
const rimraf = require('rimraf')
const test = require('tap').test
const { pipeline, Readable, Writable } = require('readable-stream')

const loc = '/tmp/level-random-' + Math.floor(Math.random() * (1 << 24))
const store = leveldown(loc)
const db = levelup(store)

function puts () {
  return ['a', 'b', 'c'].map(key => {
    return { type: 'put', key: key, value: key.toUpperCase() }
  })
}

test('setup', t => {
  db.batch(puts(), er => {
    t.end()
  })
})

function someKeys () {
  return ['a', 'b', 'x', 'c'].sort(() => {
    return 0.5 - Math.random()
  })
}

function read (t, keys, ec, cb) {
  const wanted = keys.filter(k => {
    return k !== 'x'
  }).map(k => {
    return k.toUpperCase()
  })

  const found = []
  const errors = []

  const stream = lr({ db: db, encoding: 'utf8', errorIfNotFound: true })

  function write () {
    let ok = true

    while (ok && keys.length) {
      ok = stream.write(keys.shift())
    }

    keys.length ? stream.once('drain', write) : stream.end()
  }

  function read () {
    let chunk

    while ((chunk = stream.read()) !== null) {
      found.push(chunk)
    }
  }

  stream.on('readable', () => {
    read()
  })

  stream.on('error', er => {
    errors.push(er)
  })

  stream.on('end', () => {
    t.deepEqual(found, wanted)
    t.is(errors.length, ec)
    if (cb) cb()
  })

  write()
}

test('read', (t) => {
  [
    { keys: ['a', 'b', 'c'], ec: 0 },
    { keys: ['a', 'b', 'c', 'x'], ec: 1 },
    { keys: ['x', 'a', 'b', 'c'], ec: 1 },
    { keys: ['a', 'x', 'b', 'c'], ec: 1 },
    { keys: ['a', 'x', 'x', 'c'], ec: 2 }
  ].forEach((s, i, arr) => {
    read(t, s.keys, s.ec, () => {
      if (i === arr.length - 1) t.end()
    })
  })
})

test('succeeding pipeline', (t) => {
  let keys = someKeys()
  let found = []

  pipeline(
    new Readable({
      read (size) {
        let key = keys.shift()
        if (!key) {
          return this.push(null)
        }
        this.push(key)
      }
    }),
    lr({ db: db, encoding: 'utf8' }),
    new Writable({
      write (chunk, enc, cb) {
        found.push(chunk)
        cb()
      },
      objectMode: true
    }),
    err => {
      if (err) throw err

      const wanted = found.map(k => {
        return k.toUpperCase()
      })

      t.deepEqual(found, wanted)
      t.end()
    }
  )
})

test('data event with error', t => {
  const stream = lr({ db: db, encoding: 'utf8', errorIfNotFound: true })

  const found = []
  const errors = []

  stream.on('data', chunk => {
    found.push(chunk)
  })

  stream.on('error', er => {
    errors.push(er)
  })

  ;['a', 'b', 'c', 'x'].forEach(k => {
    stream.write(k)
  })

  stream.end(() => {
    t.deepEqual(found, ['A', 'B', 'C'])
    t.is(errors.length, 1)
    t.end()
  })
})

test('teardown', t => {
  t.plan(2)
  db.close()
  t.ok(db.isClosed(), 'should be closed')
  rimraf(loc, er => {
    fs.stat(loc, er => {
      t.ok(er, 'should be removed')
      t.end()
    })
  })
})
