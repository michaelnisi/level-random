[![Build Status](https://secure.travis-ci.org/michaelnisi/level-random.svg)](http://travis-ci.org/michaelnisi/level-random)
[![Coverage Status](https://coveralls.io/repos/github/michaelnisi/level-random/badge.svg?branch=master)](https://coveralls.io/github/michaelnisi/level-random?branch=master)

# level-random - read random levelup values

The **level-random** [Node.js](http://nodejs.org/) module implements a [Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform_1) stream for reading values of random keys in [levelup](https://github.com/rvagg/node-levelup).

## Usage

Reading values for random keys from [levelup](https://github.com/rvagg/node-levelup).

```js
const encode = require('encoding-down')
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('level-random')
const { pipeline, Writable } = require('readable-stream')

const db = levelup(encode(leveldown('/tmp/level-random-example.db')))
const keys = ['a', 'b', 'c']

// Putting our values except for 'b', before reading with level-random
// and logging values to the console.
db.batch([
  { type: 'put', key: keys[0], value: 'hey' },
  { type: 'put', key: keys[2], value: 'you' }
], er => {
  const values = lr({ db: db })

  // Setting up our pipeline.
  pipeline(values, new Writable({
    write (chunk, enc, cb) {
      console.log('%s', chunk)
      cb()
    }
  }), (er) => {
    if (er) throw er
    console.log('ok')
  })

  // Reading values for all keys.
  keys.forEach(key => {
    values.write(key)
  })

  values.end()
})
```

Run it:

```
$ node example.js
```

## Types

### opts()

`Object` passed to Transform stream constructor.

- `db` The mandatory [levelup](https://github.com/rvagg/node-levelup) instance.
- `errorIfNotFound` Emit error if key is not found `Boolean=false`.
- `fillCache` Fill LevelDB's LRU-cache `Boolean=false`.

## Exports

**level-random** exports a sole function that returns a Transform stream which transforms keys to values.

```js
var lr = require('level-random')
lr(opts())
```

At large, of course, we leverage the lexicographical sort order of keys in log structured databases to very efficiently stream ranges. Occasionally though, we have to read randomly from the store. This module provides a value stream for arbitrary keys, ignoring non-existing keys by default.

## Installation

With [npm](https://npmjs.org/package/level-random), do:

```
$ npm install level-random
```

## License

[MIT License](https://github.com/michaelnisi/level-random/blob/master/LICENSE)
