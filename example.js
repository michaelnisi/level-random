// A quick example of reading random values with level-random.

const assert = require('assert')
const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('./')

levelup(leveldown('/tmp/level-random-example.db'), (er, db) => {
  assert(!er)

  db.batch([
    { type: 'put', key: 'a', value: 'hey\n' },
    { type: 'put', key: 'b', value: 'you\n' }
  ], (er) => {
    const values = lr({ db: db })
    values.pipe(process.stdout)
    values.write('a')
    values.end('b')
  })
})
