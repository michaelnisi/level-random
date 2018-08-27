// A quick example of reading random values with level-random.

const leveldown = require('leveldown')
const levelup = require('levelup')
const lr = require('./')

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
