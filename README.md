
# level-random - read randomly

The level-random [Node.js](http://nodejs.org/) module implements a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1) stream to read values for random keys in an [LevelUP](https://github.com/rvagg/node-levelup) instance.

[![Build Status](https://secure.travis-ci.org/michaelnisi/level-random.svg)](http://travis-ci.org/michaelnisi/level-random) [![David DM](https://david-dm.org/michaelnisi/level-random.svg)](http://david-dm.org/michaelnisi/level-random)

## Usage

```js
var levelup = require('levelup')
  , lr = require('level-random')
  ;

function read (db) {
  var values = lr({ db: db })
  values.on('readable', function () {
    var chunk
    while (null !== (chunk = values.read())) {
      console.log('%s', chunk)
    }
  })
  values.on('error', function (er) {
    console.error(er)
  })
  var keys = ['a', 'b']
  function write () {
    while (keys.length && values.write(keys.shift())) {}
    keys.length ? values.on('drain', write) : values.end('c')
  }
  write()
}

levelup('/tmp/level-random.db', function (er, db) {
  db.batch([
    { type: 'put', key: 'a', value: 'A' }
  , { type: 'put', key: 'b', value: 'B' }
  ], function (er) {
    read(db)
  })
})
```

## types

### db()

The mandatory [LevelUP](https://github.com/rvagg/node-levelup) instance.

### opts()

The options for the level-random Transform stream.

```js
- db db() | undefined
- decodeStrings Boolean | true
- encoding String | undefined
- fillCache Boolean | true
- highWaterMark Number | 16000
- objectMode Boolean | false
```

## exports

level-random exports a sole function that returns a Transform stream which transforms keys to values. 

```js
var lr = require('level-random')
lr(opts())
```

Although, in general, we leverage the lexicographical sort order of [LevelDB](http://leveldb.org/) keys (to stream ranges), occasionally we encounter the oddball use case which requires to read randomly from the store. To read a bunch of unsorted values for random keys this module might be useful.

## Installation

[![NPM](https://nodei.co/npm/level-random.svg)](https://npmjs.org/package/level-random)

## License

[ICS License](https://github.com/michaelnisi/level-random/blob/master/LICENSE)
