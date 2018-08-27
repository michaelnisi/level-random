'use strict'

const es = require('event-stream')
const fs = require('fs')
const levelup = require('levelup')
const lr = require('./')
const rimraf = require('rimraf')
const test = require('tap').test
const leveldown = require('leveldown')

const loc = '/tmp/level-random-' + Math.floor(Math.random() * (1 << 24))
const store = leveldown(loc)
const db = levelup(store)

function puts () {
  return ['a', 'b', 'c'].map(function (key) {
    return { type: 'put', key: key, value: key.toUpperCase() }
  })
}

test('setup', function (t) {
  db.batch(puts(), function (er) {
    t.end()
  })
})

test('defaults', function (t) {
  t.ok(!lr({db: db}).opts.fillCache)
  t.ok(lr({db: db, fillCache: true}).opts.fillCache)
  t.ok(!lr({db: db}).errorIfNotFound)
  t.ok(lr({db: db, errorIfNotFound: true}).errorIfNotFound)
  t.end()
})

function someKeys () {
  return ['a', 'b', 'x', 'c'].sort(function () {
    return 0.5 - Math.random()
  })
}

function read (t, keys, ec, cb) {
  var wanted = keys.filter(function (k) {
    return k !== 'x'
  }).map(function (k) {
    return k.toUpperCase()
  })
  var found = []
  var errors = []
  var stream = lr({ db: db, encoding: 'utf8', errorIfNotFound: true })
  function write () {
    var ok = true
    while (ok && keys.length) {
      ok = stream.write(keys.shift())
    }
    keys.length ? stream.once('drain', write) : stream.end()
  }
  function read () {
    var chunk
    while ((chunk = stream.read()) !== null) {
      found.push(chunk)
    }
  }
  stream.on('readable', function () {
    read()
  })
  stream.on('error', function (er) {
    errors.push(er)
  })
  stream.on('end', function () {
    t.deepEqual(found, wanted)
    t.is(errors.length, ec)
    t.is(stream.db, null)
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

test('pipe sans error', function (t) {
  t.plan(2)
  var stream = lr({ db: db, encoding: 'utf8' })
  es.readArray(someKeys())
    .pipe(stream)
    .pipe(es.writeArray(function (er, found) {
      var wanted = found.map(function (k) {
        return k.toUpperCase()
      })
      t.deepEqual(found, wanted)
      t.is(stream.db, null)
      t.end()
    }))
})

test('data event with error', function (t) {
  var stream = lr({ db: db, encoding: 'utf8', errorIfNotFound: true })
  var found = []
  var errors = []
  stream.on('data', function (chunk) {
    found.push(chunk)
  })
  stream.on('error', function (er) {
    errors.push(er)
  })
  ;['a', 'b', 'c', 'x'].forEach(function (k) {
    stream.write(k)
  })
  stream.end(function () {
    t.deepEqual(found, ['A', 'B', 'C'])
    t.is(errors.length, 1)
    t.is(stream.db, null)
    t.end()
  })
})

test('teardown', function (t) {
  t.plan(2)
  db.close()
  t.ok(db.isClosed(), 'should be closed')
  rimraf(loc, function (er) {
    fs.stat(loc, function (er) {
      t.ok(er, 'should be removed')
      t.end()
    })
  })
})
