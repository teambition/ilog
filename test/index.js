'use strict'

const assert = require('assert')
const tman = require('tman')
const format = require('util').format

test(require('../index.js'))

// require('@std/esm')
test(require('@std/esm')(module)('../index.mjs').default)

function test (ilog) {
  tman.suite('ilog', function () {
    tman.it('ilog.log', function () {
      assert.strictEqual(ilog.log, ilog)
      ilog.log()
      assert.strictEqual(getStdout(), void 0)

      ilog.log('')
      assert.strictEqual(getStdout(), format('') + '\n')

      ilog.log(null)
      assert.strictEqual(getStdout(), format(null) + '\n')

      ilog.log(0)
      assert.strictEqual(getStdout(), format(0) + '\n')

      ilog.log(null, 0, [])
      assert.strictEqual(getStdout(), format(null, 0, []) + '\n')
    })

    tman.it('ilog.level, ilog.levels', function () {
      assert.strictEqual(ilog.level, 7)
      ilog.level = -1
      ilog.emergency(new Error('test'))
      assert.strictEqual(getStderr(), void 0)

      ilog.level = 0
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.alert(new Error('test'))
      assert.strictEqual(getStderr(), void 0)

      ilog.level = 1
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.alert(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[1]).message, 'test')
      ilog.critical(new Error('test'))
      assert.strictEqual(getStderr(), void 0)

      ilog.level = 2
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.critical(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[2]).message, 'test')
      ilog.error(new Error('test'))
      assert.strictEqual(getStderr(), void 0)

      ilog.level = 3
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.error(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[3]).message, 'test')
      ilog.warning(new Error('test'))
      assert.strictEqual(getStderr(), void 0)

      ilog.level = 4
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.warning(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[4]).message, 'test')
      ilog.notice({message: 'test'})
      assert.strictEqual(getStderr(), void 0)
      assert.strictEqual(getStdout(), void 0)

      ilog.level = 5
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.notice({message: 'test'})
      assert.strictEqual(validStandardLog(getStdout(), ilog.levels[5]).message, 'test')
      ilog.info({message: 'test'})
      assert.strictEqual(getStdout(), void 0)

      ilog.level = 6
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.info({message: 'test'})
      assert.strictEqual(validStandardLog(getStdout(), ilog.levels[6]).message, 'test')
      ilog.debug({message: 'test'})
      assert.strictEqual(getStdout(), void 0)

      ilog.level = 7
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.debug({message: 'test'})
      assert.strictEqual(validStandardLog(getStdout(), ilog.levels[7]).message, 'test')

      ilog.level = 8
      ilog.emergency(new Error('test'))
      assert.strictEqual(validStandardLog(getStderr(), ilog.levels[0]).message, 'test')
      ilog.debug({message: 'test'})
      assert.strictEqual(validStandardLog(getStdout(), ilog.levels[7]).message, 'test')

      ilog.level = 7
    })

    tman.it('ilog._time', function () {
      let _time = ilog._time
      ilog._time = function (time) {
        assert.strictEqual(time instanceof Date, true)
        return ''
      }
      ilog.info({})
      assert.strictEqual(getStdout(), 'INFO {}\n')

      ilog._time = function (time) {
        assert.strictEqual(time instanceof Date, true)
        return 'test'
      }
      ilog.info({})
      assert.strictEqual(getStdout(), 'test INFO {}\n')

      ilog._time = _time
    })

    tman.it('ilog._stringify', function () {
      let _stringify = ilog._stringify
      ilog._stringify = function (obj) {
        assert.deepEqual(obj, [1, 2, 3])
        return 'test'
      }
      ilog.info([1, 2, 3])
      let res = getStdout()
      res = res.slice(res.indexOf(' ') + 1)
      assert.strictEqual(res, 'INFO test\n')
      ilog._stringify = _stringify
    })

    tman.it('ilog._assembleLog', function () {
      let _assembleLog = ilog._assembleLog
      ilog._assembleLog = function (log, level, time) {
        assert.deepEqual(log, JSON.stringify([1, 2, 3]))
        assert.strictEqual(level, 'INFO')
        assert.strictEqual(new Date(time.slice(1, -1)) <= Date.now(), true)
        return 'test'
      }
      ilog.info([1, 2, 3])
      let res = getStdout()
      res = res.slice(res.indexOf(' ') + 1)
      assert.strictEqual(res, 'test')
      ilog._assembleLog = _assembleLog
    })

    tman.it('ilog.error, ilog._errorify', function () {
      let err = new Error('err')
      let _errorify = ilog._errorify
      ilog._errorify = function (error) {
        assert.strictEqual(error, err)
        return [{}]
      }
      ilog.error(err)
      let res = getStderr()
      res = res.slice(res.indexOf(' ') + 1)
      assert.strictEqual(res, 'ERR [{}]\n')
      ilog._errorify = _errorify

      ilog.error()
      assert.strictEqual(getStderr(), void 0)

      ilog.error({message: 'message'})
      res = validStandardLog(getStderr(), 'ERR')
      assert.strictEqual(res.name, 'Error')
      assert.strictEqual(res.message, 'message')
      assert.strictEqual(res.stack, void 0)

      err.status = 404
      err.stack = 'stack'
      err.test = 'test'
      ilog.error(err)
      res = validStandardLog(getStderr(), 'ERR')
      assert.strictEqual(res.name, 'Error')
      assert.strictEqual(res.message, 'err')
      assert.strictEqual(res.stack, 'stack')
      assert.strictEqual(res.status, 404)
      assert.strictEqual(res.test, 'test')
    })

    tman.it('ilog.debug', function () {
      ilog.debug()
      assert.strictEqual(getStdout(), void 0)

      ilog.debug([1, 2, 3])
      assert.deepEqual(validStandardLog(getStdout(), 'DEBUG'), [1, 2, 3])

      ilog.debug({message: 'message'})
      assert.deepEqual(validStandardLog(getStdout(), 'DEBUG'), {message: 'message'})

      ilog.debug(null, 0, {}, [])
      let res = splitLog(getStdout())
      assert.strictEqual(res[1], 'DEBUG')
      assert.strictEqual(res[2], 'null 0 {} []')
    })

    tman.it('ilog.auto', function () {
      ilog.auto()
      assert.strictEqual(getStderr(), void 0)
      assert.strictEqual(getStdout(), void 0)

      ilog.auto(null)
      assert.strictEqual(getStderr(), void 0)
      assert.strictEqual(getStdout(), void 0)

      ilog.auto(new Error('err1'))
      assert.strictEqual(validStandardLog(getStderr(), 'ERR').message, 'err1')

      ilog.auto(new Error('err2'), [1, 2, 3])
      assert.strictEqual(validStandardLog(getStderr(), 'ERR').message, 'err2')
      assert.strictEqual(getStdout(), void 0)

      ilog.auto(null, [1, 2, 3])
      assert.strictEqual(getStderr(), void 0)
      assert.deepEqual(validStandardLog(getStdout(), 'INFO'), [1, 2, 3])

      ilog.auto([1, 2, 3])
      assert.strictEqual(getStderr(), void 0)
      assert.deepEqual(validStandardLog(getStdout(), 'INFO'), [1, 2, 3])

      ilog.auto(0, {}, [])
      let res = splitLog(getStdout())
      assert.strictEqual(res[1], 'DEBUG')
      assert.strictEqual(res[2], '0 {} []')

      ilog.auto(null, 0, {}, [])
      res = splitLog(getStdout())
      assert.strictEqual(res[1], 'DEBUG')
      assert.strictEqual(res[2], '0 {} []')
    })
  })

  // fake write stream

  let _stdout
  ilog._stdout = {}
  ilog._stdout.write = function (str) {
    _stdout = str
  }

  function getStdout () {
    let res = _stdout
    _stdout = void 0
    return res
  }

  let _stderr
  ilog._stderr = {}
  ilog._stderr.write = function (str) {
    _stderr = str
  }

  function getStderr () {
    let res = _stderr
    _stderr = void 0
    return res
  }
}

function splitLog (log) {
  let res = /^(\S+) (\S+) ([^]+)$/.exec(log.slice(0, -1))
  return res.slice(1)
}

function validStandardLog (log, level) {
  assert.strictEqual(typeof log, 'string')
  let res = splitLog(log)
  assert.strictEqual(new Date(res[0].slice(1, -1)) <= Date.now(), true)
  assert.strictEqual(res[1], level)
  return JSON.parse(res[2])
}
