
var levelup = require('levelup')
var lr = require('./')

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
