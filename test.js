
var es = require('event-stream')
  , fs = require('fs')
  , test = require('tap').test
  , levelup = require('levelup')
  , lr = require('./')
  , rimraf = require('rimraf')
  ;

var loc = '/tmp/random-' + Math.floor(Math.random() * (1<<24))
  , db = levelup(loc)
  ;

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
  t.plan(1)
  var values = lr({ db:db })
    , found = []
    ;
  values.on('readable', function () {
    var chunk
    while (null !== (chunk = values.read())) {
      found.push(chunk)
    }
  })
  values.on('error', function (er) {
    t.ok(false)
  })
  values.on('finish', function () {
    t.is(found.length, 3)
    t.end()
  })
  var keys = ['a', 'b', 'c']
  function write () {
    while (keys.length && values.write(keys.shift())) {}
    keys.length ? values.on('drain', write) : values.end()
  }
  write()
})

test('pipe', function (t) {
  t.plan(1)
  es.readArray(['a', 'b', 'c'])
    .pipe(lr({ db:db, encoding:'utf8' }))
    .pipe(es.writeArray(function (er, found) {
      var wanted = ['A', 'B', 'C']
      t.deepEqual(found, wanted)
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
