[![Build Status](https://secure.travis-ci.org/michaelnisi/level-random.svg)](http://travis-ci.org/michaelnisi/level-random)
[![Coverage Status](https://coveralls.io/repos/github/michaelnisi/level-random/badge.svg?branch=master)](https://coveralls.io/github/michaelnisi/level-random?branch=master)

# level-random - read random levelup values

The **level-random** [Node.js](http://nodejs.org/) module implements a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1) stream for reading values of random keys in [levelup](https://github.com/rvagg/node-levelup).

## Usage

```js
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('level-random')

levelup(leveldown('/tmp/level-random-example.db'), (er, db) => {
  if (er) throw er

  db.batch([
    { type: 'put', key: 'a', value: 'hey\n' },
    { type: 'put', key: 'c', value: 'you\n' }
  ], (er) => {
    const values = lr({ db: db })
    values.pipe(process.stdout)
    values.write('a')
    values.write('b') // optionally emitting an error
    values.end('c')
  })
})
```

## Types

### opts()

`Object` passed to Transform stream constructor.

- `db` The mandatory [LevelUP](https://github.com/rvagg/node-levelup) instance
- `errorIfNotFound` Emit error if key is not found `Boolean=false`
- `fillCache` Fill LevelDB's LRU-cache `Boolean=false`

## Exports

**level-random** exports a sole function that returns a Transform stream which transforms keys to values.

```js
var lr = require('level-random')
lr(opts())
```

At large, of course, we leverage the lexicographical sort order of keys in [LevelDB](http://leveldb.org/) to very efficiently stream ranges. Occasionally though, we encounter the oddball use case, requiring us to read randomly from the store. This module might be useful for streaming random values from the store.

## Installation

With [npm](https://npmjs.org/package/level-random), do:

```
$ npm install level-random
```

## License

[MIT License](https://github.com/michaelnisi/level-random/blob/master/LICENSE)
