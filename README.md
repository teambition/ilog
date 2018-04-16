# ilog

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
const ilog = require('ilog')
```

or
```ts
import { ilog } from 'ilog'
```

### `ilog([arguments])` [no level]

### `ilog.log([arguments])` [no level]

Format one or more arguments to string and write it to `ilog._stdout`.

Example:

```js
ilog('hello', {a: 1, b: 2}, [1, 2, 3])
// Output: hello { a: 1, b: 2 } [ 1, 2, 3 ]
```

Source Code:

```js
function ilog () {
  if (arguments.length) {
    ilog._stdout.write(ilog._assembleLog(util.format.apply(null, arguments)))
  }
}
```

### `ilog.emerg(error)` [level 0]

### `ilog.alert(error)` [level 1]

### `ilog.crit(error)` [level 2]

### `ilog.error(error)` [level 3]

### `ilog.warning(error)` [level 4]

Format the `error` object to error string and write it to `ilog._stderr`.

Example:

```js
ilog.error()
// Nothing

ilog.error(null)
// Nothing

ilog.level = 3
ilog.error(new Error('test error'))
// Output: [2015-11-02T14:07:52.368Z] ERROR {"message":"test error","name":"Error","stack":"Error: test error\n ..."}

ilog.error('test error 2')
// Output: [2015-11-02T14:07:52.368Z] ERROR {"name":"Error","message":"test error 2"}

ilog.warning(new Error('test warning'))
// Nothing, because log level is lower than warning level[level 4]
```

Source Code:

```js
// ilog.emerg, ilog.alert, ilog.crit, ilog.error, ilog.warning
levels.slice(0, 5).map(function (level, index) {
  ilog[level.toLowerCase()] = function (error) {
    if (error != null && index <= ilog.level) {
      error = ilog._stringify(ilog._errorify(error))
      ilog._stderr.write(ilog._assembleLog(error, level, ilog._time(new Date())))
    }
  }
})
```

### `ilog.notice(message)` [level 5]

### `ilog.info(message)` [level 6]

Format the `message` object to string and write it to `ilog._stdout`.

Example:

```js
ilog.info()
// Nothing

ilog.info(null)
// Nothing

ilog.notice({a: 1, b: 2})
// Output: [2015-11-02T14:11:44.588Z] NOTICE {"a":1,"b":2}

ilog.info('{a: 1, b: 2}')
// [2015-11-05T07:21:36.916Z] INFO "{a: 1, b: 2}"
```

Source Code:

```js
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
```

### `ilog.debug(message[, message, ...])` [level 7]

Format one or more arguments to string and write it to `ilog._stdout`.
if only one argument, use `JSON.stringify`, else use `util.format`

Example:

```js
ilog.debug({a: 1, b: 2})
// [2015-11-05T07:24:55.551Z] DEBUG {"a":1,"b":2}

ilog.debug('{a: 1, b: 2}')
// [2015-11-05T07:25:20.103Z] DEBUG "{a: 1, b: 2}"

ilog.debug(null, {a: 1, b: 2}, null, [1, 2, 3])
// [2015-11-05T07:26:03.119Z] DEBUG null { a: 1, b: 2 } null [ 1, 2, 3 ]

ilog.debug('Hello, %s', [1, 2, 3], {a: 1, b: 2})
// [2015-11-05T07:27:02.020Z] DEBUG Hello, 1,2,3 { a: 1, b: 2 }
```

Source Code:

```js
// ilog.notice, ilog.info
ilog.debug = function () {
  if (arguments.length && ilog.level >= 7) {
    let messages = arguments.length === 1
      ? ilog._stringify(arguments[0]) : util.format.apply(null, arguments)
    ilog._stdout.write(ilog._assembleLog(messages, 'DEBUG', ilog._time(new Date())))
  }
}
```

### `ilog.auto(error[, message])` [level error, info, debug]

A `error` (`error instanceof Error`) will log to `ilog.error`.
A message will log to `ilog.info`.
One more message will log to `ilog.debug`.

Example:

```js
ilog.auto(new Error('some error'), {a: 1, b: 2})
// Output: [2015-11-02T14:13:24.409Z] ERROR {"message":"some error","name":"Error","stack":"Error: some error\n ..."}
ilog.auto(null, {a: 1, b: 2})
// Output: [2015-11-02T14:14:18.483Z] INFO {"a":1,"b":2}
ilog.auto({a: 1, b: 2})
// Output: [2015-11-02T14:14:53.412Z] INFO {"a":1,"b":2}
ilog.auto(null, {a: 1, b: 2}, [1, 2, 3])
// Output: [2015-11-02T14:15:16.933Z] DEBUG { a: 1, b: 2 } [ 1, 2, 3 ]
ilog.auto({a: 1, b: 2}, [1, 2, 3])
// Output: [2015-11-02T14:15:41.398Z] DEBUG { a: 1, b: 2 } [ 1, 2, 3 ]
```

Source Code:

```js
ilog.auto = function (error) {
  if (error instanceof Error) return ilog.error(error)
  let args = slice.call(arguments, +(error == null))
  if (args.length === 1) ilog.info(args[0])
  else if (args.length > 1) ilog.debug.apply(null, args)
}
```

### `ilog.setLevel(level)`

Set the log `level`, any value in `ilog.levels` will be fine, default to `DEBUG`

### `ilog.levels`

All log levels: `['EMERG', 'ALERT', 'CRIT', 'ERR', 'WARNING', 'NOTICE', 'INFO', 'DEBUG']`.

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

### `ilog._assembleLog`

Set the log format function, default to:

```js
ilog._assembleLog = function (log, level, time) {
  log = log + '\n'
  if (level) log = level + ' ' + log
  if (time) log = time + ' ' + log
  return log
}
```

### `ilog._errorify`

Set the error object format function, default to:

```js
ilog._errorify = function (error) {
  return new Errorify(error)
}
```

[npm-url]: https://npmjs.org/package/ilog
[npm-image]: http://img.shields.io/npm/v/ilog.svg

[travis-url]: https://travis-ci.org/teambition/ilog
[travis-image]: http://img.shields.io/travis/teambition/ilog.svg

[downloads-url]: https://npmjs.org/package/ilog
[downloads-image]: http://img.shields.io/npm/dm/ilog.svg?style=flat-square
