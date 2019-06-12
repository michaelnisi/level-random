'use-strict'

// example - read values for keys ignoring missing key

const encode = require('encoding-down')
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('./')
const { pipeline, Readable, Writable } = require('readable-stream')

const db = levelup(encode(leveldown('/tmp/level-random-example.db')))

db.batch([
  { type: 'put', key: 'a', value: 'you' },
  { type: 'put', key: 'c', value: 'are' }
], er => {
  if (er) throw er

  const keys = ['a', 'b', 'c']

  pipeline(
    new Readable({
      read (length) {
        this.push(keys.shift() || null)
      }
    }),
    lr({ db: db }),
    new Writable({
      write (chunk, enc, cb) {
        console.log('%s', chunk)
        cb()
      }
    }),
    er => {
      if (er) throw er
      console.log('ok')
    }
  )
})
