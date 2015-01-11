
module.exports = exports = Random

var stream = require('stream')
var util = require('util')

function defaults (opts) {
  opts = opts || Object.create(null)
  opts.fillCache = opts.fillCache || true
  opts.errorIfNotFound = opts.errorIfNotFound || false
  return opts
}

util.inherits(Random, stream.Transform)
function Random (opts) {
  opts = defaults(opts)
  if (!(this instanceof Random)) return new Random(opts)
  stream.Transform.call(this, opts)
  util._extend(this, opts)
  this.opts = {
    fillCache: this.fillCache
  }
}

Random.prototype._transform = function (chunk, enc, cb) {
  var me = this
  this.db.get(chunk, this.opts, function (er, value) {
    if (!er) {
      me.push(value)
    } else if (!me.errorIfNotFound && er.notFound) {
      er = null
    }
    cb(er)
  })
}

Random.prototype._flush = function (cb) {
  this.db = null
  cb()
}
