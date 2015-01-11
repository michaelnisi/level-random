
var es = require('event-stream')
var fs = require('fs')
var levelup = require('levelup')
var lr = require('./')
var rimraf = require('rimraf')
var test = require('tap').test

var loc = '/tmp/random-' + Math.floor(Math.random() * (1<<24))
var db = levelup(loc)

function puts () {
  return ['a', 'b', 'c'].map(function (key) {
    return { type:'put', key:key, value:key.toUpperCase() }
  })
}

test('setup', function (t) {
  db.batch(puts(), function (er) {
    t.end()
  })
})

test('read', function (t) {
  t.plan(3)
  var keys = ['a', 'b', 'x', 'c']
  var found = []
  var errors = []
  var values = lr({ db:db, errorIfNotFound: true })
  values.on('readable', function () {
    var chunk
    while (null !== (chunk = values.read())) { found.push(chunk) }
    keys.length ? values.write(keys.shift()) : values.end()
  })
  values.on('error', function (er) {
    errors.push(er)
    values.resume()
  })
  values.on('finish', function () {
    t.is(found.length, 3)
    t.is(errors.length, 1)
    t.is(values.db, null)
    t.end()
  })
  values.write(keys.shift())
})

test('pipe', function (t) {
  t.plan(2)
  var values = lr({ db:db, encoding:'utf8' })
  es.readArray(['x', 'a', 'b', 'c'])
    .pipe(values)
    .pipe(es.writeArray(function (er, found) {
      var wanted = ['A', 'B', 'C']
      t.deepEqual(found, wanted)
      t.is(values.db, null)
      t.end()
    }))
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
