ilog
====
light-weight, smart and pure log module.

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]


## Installation

```sh
npm install ilog
```

## API

```js
var ilog = require('ilog')
```

### `ilog([arguments])` [no level]
### `ilog.log([arguments])` [no level]

Format arguments to string and write it to `ilog._stdout`.

Example:
```js
ilog('hello', {a: 1, b: 2}, [1, 2, 3])
// Out: hello { a: 1, b: 2 } [ 1, 2, 3 ]
```

Source Code:
```js
function ilog () {
  var msg = util.format.apply(null, arguments)
  ilog._stdout.write(msg + '\n')
}
```

### `ilog.emergency(error)` [level 0]
### `ilog.alert(error)` [level 1]
### `ilog.critical(error)` [level 2]
### `ilog.error(error)` [level 3]
### `ilog.warning(error)` [level 4]

Format the `error` object to error string and write it to `ilog._stderr`.

Example:
```js
ilog.level = 3
ilog.error(new Error('test error'))
// Out: [2015-11-02T14:07:52.368Z] ERROR {"message":"test error","name":"Error","stack":"Error: test error\n ..."}
ilog.warning(new Error('test warning'))
// Nothing, because log level is lower than warning level[level 4]
```

Source Code:
```js
// ilog.emergency, ilog.alert, ilog.critical, ilog.error, ilog.warning
levels.slice(0, 5).map(function (level, index) {
  ilog[level.toLowerCase()] = function (error) {
    if (error == null || ilog.level < index) return
    error = ilog._stringify(new ErrorMessage(error))
    ilog._stderr.write(ilog._time(new Date()) + ' ' + level + ' ' + error + '\n')
  }
})
```

### `ilog.notice(message)` [level 5]
### `ilog.info(message)` [level 6]
### `ilog.debug(message)` [level 7]

Format the `message` object to string and write it to `ilog._stdout`.

Example:
```js
ilog.level = 6
ilog.info({a: 1, b: 2})
// Out: [2015-11-02T14:11:44.588Z] INFO {"a":1,"b":2}
ilog.debug({a: 1, b: 2})
// Nothing, because log level is lower than debug level[level 7]
```

Source Code:
```js
// ilog.notice, ilog.info, ilog.debug
levels.slice(5, 7).map(function (level, index) {
  index += 5
  ilog[level.toLowerCase()] = function (message) {
    if (message == null || ilog.level < index) return
    message = ilog._stringify(message)
    ilog._stdout.write(ilog._time(new Date()) + ' ' + level + ' ' + message + '\n')
  }
})
```

### `ilog.auto(error[, message])` [level error, info, debug]

A `error` (`error instanceof Error`) will log to `ilog.error`.
A message will log to `ilog.info`.
One more message will log to `ilog.debug`.

Example:
```js
ilog.level = 7 // default level
ilog.auto(new Error('some error'), {a: 1, b: 2})
// Out: [2015-11-02T14:13:24.409Z] ERROR {"message":"some error","name":"Error","stack":"Error: some error\n ..."}
ilog.auto(null, {a: 1, b: 2})
// Out: [2015-11-02T14:14:18.483Z] INFO {"a":1,"b":2}
ilog.auto({a: 1, b: 2})
// Out: [2015-11-02T14:14:53.412Z] INFO {"a":1,"b":2}
ilog.auto(null, {a: 1, b: 2}, [1, 2, 3])
// Out: [2015-11-02T14:15:16.933Z] DEBUG { a: 1, b: 2 } [ 1, 2, 3 ]
ilog.auto({a: 1, b: 2}, [1, 2, 3])
// Out: [2015-11-02T14:15:41.398Z] DEBUG { a: 1, b: 2 } [ 1, 2, 3 ]
```

Source Code:
```js
ilog.auto = function (error) {
  if (error instanceof Error) return ilog.error(error)
  var args = slice.call(arguments, +(error == null))
  if (args.length === 1) ilog.info(args[0])
  else if (args.length > 1) ilog.debug.apply(null, args)
}
```

### `ilog.level`
Set the log level, default to `7`

### `ilog.levels`
All log levels: `['EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG']`.

### `ilog._stdout`
Set the log standard out stream, default to `process.stdout`

### `ilog._stderr`
Set the log error out stream, default to `process.stderr`

### `ilog._time`
Set the time format function, default to:

```js
ilog._time = function (time) {
  return '[' + time.toISOString() + ']'
}
```

### `ilog._stringify`
Set the object format function, default to:

```js
ilog._stringify = function (obj) {
  try {
    return JSON.stringify(obj)
  } catch (e) {
    return util.format(obj)
  }
}
```

[npm-url]: https://npmjs.org/package/ilog
[npm-image]: http://img.shields.io/npm/v/ilog.svg

[travis-url]: https://travis-ci.org/teambition/ilog
[travis-image]: http://img.shields.io/travis/teambition/ilog.svg

[downloads-url]: https://npmjs.org/package/ilog
[downloads-image]: http://img.shields.io/npm/dm/ilog.svg?style=flat-square
