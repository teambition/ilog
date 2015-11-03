// **Github:** https://github.com/teambition/ilog
//
// **License:** MIT
'use strict'

var util = require('util')
var slice = Array.prototype.slice
var levels = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG']

module.exports = ilog

function ilog () {
  var msg = util.format.apply(null, arguments)
  ilog._stdout.write(msg + '\n')
}

ilog.level = 7
ilog.levels = levels.slice()

// ilog.emergency, ilog.alert, ilog.critical, ilog.error, ilog.warning
levels.slice(0, 5).map(function (level, index) {
  ilog[level.toLowerCase()] = function (error) {
    if (error == null || ilog.level < index) return
    error = ilog._stringify(new ErrorMessage(error))
    ilog._stderr.write(ilog._time(new Date()) + ' ' + level + ' ' + error + '\n')
  }
})

// ilog.notice, ilog.info, ilog.debug
levels.slice(5, 7).map(function (level, index) {
  index += 5
  ilog[level.toLowerCase()] = function (message) {
    if (message == null || ilog.level < index) return
    message = ilog._stringify(message)
    ilog._stdout.write(ilog._time(new Date()) + ' ' + level + ' ' + message + '\n')
  }
})

ilog.debug = function () {
  if (ilog.level < 7) return
  var message = util.format.apply(null, arguments)
  ilog._stdout.write(ilog._time(new Date()) + ' DEBUG ' + message + '\n')
}

ilog.auto = function (error) {
  if (error instanceof Error) return ilog.error(error)
  var args = slice.call(arguments, +(error == null))
  if (args.length === 1) ilog.info(args[0])
  else if (args.length > 1) ilog.debug.apply(null, args)
}

ilog.log = ilog
ilog._stdout = process.stdout
ilog._stderr = process.stderr
ilog._time = function (time) {
  return '[' + time.toISOString() + ']'
}
ilog._stringify = function (obj) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return util.format(obj)
  }
}

function ErrorMessage (error) {
  var ctx = this
  this.name = error.name || 'Error'
  this.message = error.message || util.format(error)

  if (error.status) this.status = error.status
  if (error.stack) this.stack = error.stack
  if (error instanceof Object && !Array.isArray(error)) {
    Object.keys(error).map(function (key) {
      if (!ctx[key]) ctx[key] = error[key]
    })
  }
}
