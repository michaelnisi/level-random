'use-strict'

// level-random - randomly read from levelup

module.exports = Random

const stream = require('readable-stream')
const util = require('util')

function defaults (opts) {
  opts = opts || Object.create(null)
  opts.fillCache = !!opts.fillCache
  opts.errorIfNotFound = !!opts.errorIfNotFound
  return opts
}

function GetOpts (fillCache) {
  this.fillCache = fillCache
}

util.inherits(Random, stream.Transform)
function Random (opts) {
  if (!(this instanceof Random)) return new Random(opts)
  opts = defaults(opts)
  stream.Transform.call(this, opts)
  this.db = opts.db
  this.errorIfNotFound = opts.errorIfNotFound
  this.opts = new GetOpts(opts.fillCache)
}

Random.prototype._transform = function (chunk, enc, cb) {
  this.db.get(chunk, this.opts, (er, value) => {
    const notFound = !!er && er.notFound
    if (notFound) {
      if (this.errorIfNotFound) this.emit('error', er)
      er = null
    }
    if (value !== null && value !== undefined) {
      this.push(value)
    }
    cb(er)
  })
}

Random.prototype._flush = function (cb) {
  this.db = null
  cb()
}
