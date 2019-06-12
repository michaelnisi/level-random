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

// Returns a put batch where values are upper case keys.
function puts () {
  return ['a', 'b', 'c'].map(key => {
    return { type: 'put', key: key, value: key.toUpperCase() }
  })
}

test('setup', t => {
  db.batch(puts(), er => {
    if (er) throw er
    t.end()
  })
})

function someKeys () {
  return ['a', 'b', 'x', 'c'].sort(() => {
    return 0.5 - Math.random()
  })
}

test('read', (t) => {
  function run (fixtures, cb) {
    let { keys } = fixtures.pop()
    let wanted = keys.flatMap(k => {
      if (k === 'x') return []
      return k.toUpperCase()
    })
    let found = []

    pipeline(
      new Readable({
        read (length) {
          this.push(keys.shift() || null)
        }
      }),
      lr({ db: db, encoding: 'utf8' }),
      new Writable({
        write (chunk, enc, cb) {
          found.push(chunk)
          cb()
        },
        decodeStrings: false
      }),
      er => {
        if (er) throw er

        t.deepEqual(found, wanted)

        if (fixtures.length === 0) {
          return cb(er)
        }

        run(fixtures, cb)
      }
    )
  }

  run([
    { keys: ['a'] },
    { keys: ['a', 'b'] },
    { keys: ['a', 'b', 'c'] },
    { keys: ['a', 'x'] },
    { keys: ['a', 'x', 'b', 'x'] },
    { keys: ['a', 'x', 'b', 'x', 'c', 'x'] },
    { keys: someKeys() }
  ], er => {
    if (er) throw er
    t.end()
  })
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
