
// level-random - read randomly

module.exports = Random

var stream = require('stream')
var util = require('util')

function defaults (opts) {
  opts = opts || Object.create(null)
  opts.fillCache = !!opts.fillCache
  opts.errorIfNotExists = !!opts.errorIfNotExists
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
  this.errorIfNotExists = opts.errorIfNotExists
  this.opts = new GetOpts(opts.fillCache)
}

Random.prototype._transform = function (chunk, enc, cb) {
  var me = this
  this.db.get(chunk, this.opts, function (er, value) {
    if (!er) {
      me.push(value)
    } else if (!me.errorIfNotExists && er.notFound) {
      er = null
    }
    cb(er)
  })
}

Random.prototype._flush = function (cb) {
  this.db = null
  cb()
}
