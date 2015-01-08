
var levelup = require('levelup')
var lr = require('./')

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
    { type: 'put', key: 'a', value: 'hey' }
  , { type: 'put', key: 'b', value: 'you' }
  ], function (er) {
    read(db)
  })
})
