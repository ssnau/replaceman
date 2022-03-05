var safe = require('safecall');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var noop = function () {};
var exec = require('../child').exec;
var execSync = require('../child').execSync;

var sampleContent = fs.readFileSync(path.join(__dirname, '../../replaceman.config.js'), 'utf8');
var lambdaTrue = (() => true);
var valFn = ((x) => x);

module.exports = async function ({filename, dry, cwd}) {
  var filepath;
  // get file content
  [
    path.join(cwd, filename),
  ].forEach(function (file) {
    if (fs.existsSync(file))  filepath = file;
  });

  if (!filepath) {
    console.log(`pleace create a ${filename} with sample content:\n`)
    console.log(sampleContent);

    console.log('args:')
    console.log(' --dry  list the files that will be affected.')
    return;
  }

  var config = require(filepath);
  var files = glob.sync(cwd + "/**")
    .filter(config.filter || lambdaTrue)
    .filter(config.ignore ? x => !config.ignore(x) : lambdaTrue)

  // deal with content
  for (let file of files) {
    var isDir = require('is-dir');
    if (isDir.sync(file)) continue;
    var content = fs.readFileSync(file, 'utf-8');
    var lasttime;
    var nc = content;
    let counts = 0;
    while (lasttime !== nc) {
      lasttime = nc;
      nc = (config.replace || valFn)(nc);
      counts++;
      if (counts % 1000 === 0) {
        console.warn("***************");
        console.warn(nc);
        console.warn("***************");
        console.warn("might run into infinite loop!");
        console.warn("File: " + file);
        break;
      }
      if (!config.autoLoop) break;
    }
    if (nc === content) continue;
    if (dry) {
      console.log(`will affect ${file}`);
    } else {
      fs.writeFileSync(file, nc, 'utf-8');
    }
  }
  // deal with rename
  if (typeof config.rename === 'function') {
    for (let file of files) {
      let newname = config.rename(path.basename(file));
      if (!newname) continue;
  
      if (newname.indexOf('/') > -1) throw new Error('rename should not contains /');
      var newfile = path.join(path.dirname(file), newname);
      if (newfile === file) continue;
      if (dry) {
        console.log(`will rename ${file} into ${newfile}`);
      } else {
        await exec(`mv ${file} ${newfile}`);
      }
    }
  }
  

  if (typeof config.exec === 'function') {
    // deal with exec
    for (let file of files) {
        var cmd = config.exec( file);
        if (dry) {
        console.log(`will run ${cmd}`);
        } else {
        await exec(cmd);
        }
    }
  }
}
