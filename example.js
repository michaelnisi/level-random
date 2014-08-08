
var levelup = require('levelup')
  , random = require('./')
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
  var keys = ['a', 'b', 'c']
  function write () {
    while (keys.length && values.write(keys.shift())) {}
    if (keys.length) values.on('drain', write)
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
