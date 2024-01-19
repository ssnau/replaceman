
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const exec = require('../child').exec;
const sampleContent = fs.readFileSync(path.join(__dirname, '../../replaceman.config.js'), 'utf8');
const lambdaTrue = () => true;

module.exports = async function ({  dry, create, cwd }) {
  const FILE_NAME = "replaceman.config.js";
  let filepath = path.join(cwd, FILE_NAME);

  if (create) {
    fs.writeFileSync(filepath, sampleContent, 'utf8');
    console.log('created replaceman.config.js');
    return;
  }

  if (!fs.existsSync(filepath)) {
    console.log(`please create a ${FILE_NAME} with sample content by running "replacemna init":\n`);
    console.log(sampleContent);

    console.log('args:');
    console.log(' --dry  list the files that will be affected.');
    return;
  }

  const config = require(filepath);
  const files = glob.sync(cwd + '/**')
    .filter(config.filter || lambdaTrue)
    .filter(config.ignore ? x => !config.ignore(x) : lambdaTrue)
    .filter(f => f !== filepath);

  // deal with content
  if (typeof config.replace === 'function') {
    for (const file of files) {
      const isDir = require('is-dir');
      if (isDir.sync(file)) continue;
      const content = fs.readFileSync(file, 'utf-8');
      const nc = config.replace(content);
      if (nc === content) continue;
      if (dry) {
        console.log(`will affect ${file}`);
      } else {
        fs.writeFileSync(file, nc, 'utf-8');
      }
    }
  }

  // deal with rename
  if (typeof config.rename === 'function') {
    for (const file of files) {
      const newname = config.rename(path.basename(file));
      if (!newname) continue;
      if (newname.indexOf('/') > -1) throw new Error('rename should not contains /');
      const newfile = path.join(path.dirname(file), newname);
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
    for (const file of files) {
      const cmd = config.exec(file);
      if (dry) {
        console.log(`will run ${cmd}`);
      } else {
        await exec(cmd);
      }
    }
  }
};
