
# level-random - read randomly

The **level-random** [Node.js](http://nodejs.org/) module implements a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1) stream to read values for random keys in an [LevelUP](https://github.com/rvagg/node-levelup) instance.

[![Build Status](https://secure.travis-ci.org/michaelnisi/level-random.svg)](http://travis-ci.org/michaelnisi/level-random)

## Usage

```js
var levelup = require('levelup')
var lr = require('level-random')

levelup('/tmp/level-random.db', function (er, db) {
  db.batch([
    { type: 'put', key: 'a', value: 'hey\n' }
  , { type: 'put', key: 'b', value: 'you\n' }
  ], function (er) {
    var values = lr({ db: db })
    values.pipe(process.stdout)
    values.write('a')
    values.end('b')
  })
})
```

## types

### opts()

`Object` passed to Transform stream constructor.

- `db` The mandatory [LevelUP](https://github.com/rvagg/node-levelup) instance.
- `errorIfNotFound` Set this `Boolean` `true` to error if a key is not found; defaults `false`
- `fillCache` Set this `Boolean` `false` to not fill LevelDB's LRU-cache; defaults `true`

## exports

**level-random** exports a sole function that returns a Transform stream which transforms keys to values.

```js
var lr = require('level-random')
lr(opts())
```

Although, in general, we leverage the lexicographical sort order of [LevelDB](http://leveldb.org/) keys (to stream ranges), occasionally we encounter the oddball use case which requires to read randomly from the store. To read a bunch of unsorted values for random keys this module might be useful.

## Installation

With [npm](https://npmjs.org/package/level-random) do:

```
$ npm install level-random
```

## License

[MIT License](https://github.com/michaelnisi/level-random/blob/master/LICENSE)
