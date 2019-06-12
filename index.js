'use-strict'

// level-random - randomly read from levelup

const { Transform } = require('readable-stream')
const { debuglog } = require('util')

debuglog('level-random')

// Returns default options from `opts` copying it.
function internals (opts) {
  const copy = Object.assign({}, opts)

  copy.fillCache = !!copy.fillCache
  copy.errorIfNotFound = !!copy.errorIfNotFound

  return copy
}

// Returns a stream to which you write LevelDB keys while you are reading
// their values. The `errorIfNotFound` option controls if non-existing keys
// should be ignored.
function createStream (opts) {
  const { db, errorIfNotFound, fillCache } = internals(opts)

  return new Transform(Object.assign({
    transform (chunk, enc, cb) {
      db.get(chunk, { fillCache: fillCache }, (er, value) => {
        const notFound = !!er && er.notFound

        if (notFound) {
          if (errorIfNotFound) this.emit('error', er)
          er = null
        }

        if (value !== null && value !== undefined) {
          this.push(value)
        }

        cb(er)
      })
    }
  }, opts))
}

module.exports = createStream
