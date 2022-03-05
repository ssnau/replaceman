const exec = require('child_process').exec
const _ = require('lodash')
// 一个拥有promise风格的exec,返回{code, out}
module.exports = {
  exec: function (command, options) {
    var options = _.merge({
      $through: true // 是否将stdout, stderr打到控制台
    }, options || {})
    return new Promise(function (resolve, reject) {
      const child = exec(command, options)
      const { $through, $silent = true } = options
      let out = ''
      const cmd = { resolve, reject }
      child.stdout.on('data', function (buf) {
        const string = String(buf)
        if ($through) process.stdout.write(string)
        out += string
      })
      child.stderr.on('data', function (buf) {
        const string = String(buf)
        if ($through) process.stdout.write(string)
        out += string
      })
      child.on('close', function (code) {
        const hasError = String(code) !== '0' && $silent !== true
        cmd[hasError ? 'reject' : 'resolve']({ code, out })
      })
    })
  }
}
