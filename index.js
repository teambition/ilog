// **Github:** https://github.com/teambition/ilog
//
// **License:** MIT
'use strict'

const format = require('util').format
const slice = Array.prototype.slice

// Level represents logging level
// https://en.wikipedia.org/wiki/Syslog
const levels = ['EMERG', 'ALERT', 'CRIT', 'ERR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG']

module.exports = ilog

function ilog () {
  if (arguments.length) {
    ilog._stdout.write(ilog._assembleLog(format.apply(null, arguments)))
  }
}

ilog.ilog = ilog
ilog.levels = levels.slice()

ilog.setLevel = function (level) {
  ilog.level = level

  if (typeof level === 'string') {
    let idx = levels.indexOf(level)
    if (idx >= 0) {
      ilog.level = idx
    }
  }
}
ilog.setLevel('DEBUG')

// ilog.emergency, ilog.alert, ilog.critical, ilog.error, ilog.warning
levels.slice(0, 5).map((level, index) => {
  ilog[level.toLowerCase()] = function (error) {
    if (error != null && index <= ilog.level) {
      error = ilog._stringify(ilog._errorify(error))
      ilog._stderr.write(ilog._assembleLog(error, level, ilog._time(new Date())))
    }
  }
})

// ilog.notice, ilog.info
levels.slice(5, 7).map((level, index) => {
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
    let messages = arguments.length === 1
      ? ilog._stringify(arguments[0]) : format.apply(null, arguments)
    ilog._stdout.write(ilog._assembleLog(messages, 'DEBUG', ilog._time(new Date())))
  }
}

ilog.auto = function (error) {
  if (error instanceof Error) return ilog.error(error)
  let args = slice.call(arguments, +(error == null))
  if (args.length === 1) ilog.info(args[0])
  else if (args.length > 1) ilog.debug.apply(null, args)
}

ilog.log = ilog
ilog.error = ilog.err
ilog.warn = ilog.warning
ilog.critical = ilog.crit
ilog.emergency = ilog.emerg
ilog._stdout = process.stdout
ilog._stderr = process.stderr

ilog._time = function (time) {
  return '[' + time.toISOString() + ']'
}

ilog._stringify = function (obj) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return format(obj)
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
  this.name = error.name || 'Error'
  this.message = error.message || format(error)

  if (error.code != null) this.code = error.code
  if (error.errno != null) this.errno = error.errno
  if (error.status != null) this.status = error.status
  if (error.syscall != null) this.syscall = error.syscall
  if (!Array.isArray(error)) {
    Object.keys(error).map((key) => {
      if (this[key] == null) this[key] = error[key]
    })
  }
  if (error.stack != null) this.stack = error.stack
}
