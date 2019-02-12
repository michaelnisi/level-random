// example - read random values with level-random

const encode = require('encoding-down')
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('./')
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
