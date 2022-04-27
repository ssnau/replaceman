var fs = require('fs');
var path = require('path');
var glob = require('glob');
var exec = require('../child').exec;

var sampleContent = fs.readFileSync(path.join(__dirname, '../../replaceman.config.js'), 'utf8');
var lambdaTrue = (() => true);
var valFn = ((x) => x);

module.exports = async function ({filename, dry, create, cwd}) {
  var filepath;
  // get file content
  [
    path.join(cwd, filename),
    path.join(cwd, filename + ".js"),
    path.join(cwd, filename + ".json"),
  ].forEach(function (file) {
    if (fs.existsSync(file))  filepath = file;
  });

  if (create) {
    fs.writeFileSync(path.join(cwd, 'replaceman.config.js'), sampleContent, 'utf8');
    console.log('created replaceman.config.js');
    return;
  }

  if (!filepath) {
    console.error(`${filename} or ${filename}.js or ${filename}.json not found!`);
    console.log(`pleace create a ${filename}.js with sample content:\n`)
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
    var nc = (config.replace || valFn)(content);
    if (nc === content) continue;
    if (dry) {
      console.log(`will affect ${file}`);
    } else {
      fs.writeFileSync(file, nc, 'utf-8');
    }
  }
  // deal with rename
  for (let file of files) {
    if (!config.rename) continue;
    var newname = (config.rename || valFn)(path.basename(file));
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
