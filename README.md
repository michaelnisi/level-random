
# level-random - read randomly

Occasionally you have to read randomly from [LevelDB](http://leveldb.org/). 

[![Build Status](https://secure.travis-ci.org/michaelnisi/level-random.svg)](http://travis-ci.org/michaelnisi/level-random) [![David DM](https://david-dm.org/michaelnisi/level-random.svg)](http://david-dm.org/michaelnisi/level-random)

## Usage

```js
var levelup = require('levelup')
  , random = require('level-random')
  ;

function read (db) {
  var values = random({ db: db })
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

## Installation

[![NPM](https://nodei.co/npm/level-random.svg)](https://npmjs.org/package/level-random)

## License

[ICS License](https://github.com/michaelnisi/level-random/blob/master/LICENSE)
