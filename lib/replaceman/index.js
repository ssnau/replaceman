
const fs = require('fs')
const path = require('path')
const glob = require('glob')
const exec = require('../child').exec
const sampleContent = fs.readFileSync(path.join(__dirname, '../../replaceman.config.js'), 'utf8')
const lambdaTrue = () => true
const valFn = (x) => x

module.exports = async function ({ filename, dry, cwd }) {
  let filepath;
  // get file content
  [
    path.join(cwd, filename)
  ].forEach(function (file) {
    if (fs.existsSync(file)) filepath = file
  })

  if (!filepath) {
    console.log(`pleace create a ${filename} with sample content:\n`)
    console.log(sampleContent)

    console.log('args:')
    console.log(' --dry  list the files that will be affected.')
    return
  }

  const config = require(filepath)
  const files = glob.sync(cwd + '/**')
    .filter(config.filter || lambdaTrue)
    .filter(config.ignore ? x => !config.ignore(x) : lambdaTrue)

  // deal with content
  for (const file of files) {
    const isDir = require('is-dir')
    if (isDir.sync(file)) continue
    const content = fs.readFileSync(file, 'utf-8')
    let lasttime
    let nc = content
    let counts = 0
    while (lasttime !== nc) {
      lasttime = nc
      nc = (config.replace || valFn)(nc)
      counts++
      if (counts % 1000 === 0) {
        console.warn('***************')
        console.warn(nc)
        console.warn('***************')
        console.warn('might run into infinite loop!')
        console.warn('File: ' + file)
        break
      }
      if (!config.autoLoop) break
    }
    if (nc === content) continue
    if (dry) {
      console.log(`will affect ${file}`)
    } else {
      fs.writeFileSync(file, nc, 'utf-8')
    }
  }
  // deal with rename
  if (typeof config.rename === 'function') {
    for (const file of files) {
      const newname = config.rename(path.basename(file))
      if (!newname) continue

      if (newname.indexOf('/') > -1) throw new Error('rename should not contains /')
      const newfile = path.join(path.dirname(file), newname)
      if (newfile === file) continue
      if (dry) {
        console.log(`will rename ${file} into ${newfile}`)
      } else {
        await exec(`mv ${file} ${newfile}`)
      }
    }
  }

  if (typeof config.exec === 'function') {
    // deal with exec
    for (const file of files) {
      const cmd = config.exec(file)
      if (dry) {
        console.log(`will run ${cmd}`)
      } else {
        await exec(cmd)
      }
    }
  }
}
