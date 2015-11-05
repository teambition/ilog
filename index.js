// **Github:** https://github.com/teambition/ilog
//
// **License:** MIT
'use strict'

var util = require('util')
var slice = Array.prototype.slice
var levels = ['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG']

module.exports = ilog

function ilog () {
  if (arguments.length) {
    ilog._stdout.write(ilog._assembleLog(util.format.apply(null, arguments)))
  }
}

ilog.level = 7
ilog.levels = levels.slice()

// ilog.emergency, ilog.alert, ilog.critical, ilog.error, ilog.warning
levels.slice(0, 5).map(function (level, index) {
  ilog[level.toLowerCase()] = function (error) {
    if (error != null && index <= ilog.level) {
      error = ilog._stringify(ilog._errorify(error))
      ilog._stderr.write(ilog._assembleLog(error, level, ilog._time(new Date())))
    }
  }
})

// ilog.notice, ilog.info
levels.slice(5, 7).map(function (level, index) {
  index += 5
  ilog[level.toLowerCase()] = function (message) {
    if (message != null && index <= ilog.level) {
      message = ilog._stringify(message)
      ilog._stdout.write(ilog._assembleLog(message, level, ilog._time(new Date())))
    }
  }
})

ilog.debug = function () {
  if (arguments.length && ilog.level >= 7) {
    var messages = arguments.length === 1
      ? ilog._stringify(arguments[0]) : util.format.apply(null, arguments)
    ilog._stdout.write(ilog._assembleLog(messages, 'DEBUG', ilog._time(new Date())))
  }
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

ilog._assembleLog = function (log, level, time) {
  log = log + '\n'
  if (level) log = level + ' ' + log
  if (time) log = time + ' ' + log
  return log
}

ilog._errorify = function (error) {
  return new Errorify(error)
}

function Errorify (error) {
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
