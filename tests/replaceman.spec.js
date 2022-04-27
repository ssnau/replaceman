/* global describe, it, beforeEach, afterEach */
const fs = require('fs');
const path = require('path');
const { strictEqual } = require('assert');
const execSync = require('child_process').execSync;
const cwd = __dirname;
const run = (cmd) => {
  try {
    const output = execSync(cmd);
    console.log(output.toString()); // just for debug purpose
    return output;
  } catch (e) {
    console.log(e);
  }
};
const fixtureDirectory = path.join(cwd, 'fixtures');
function createConfigFile ({ filter, replace, rename, exec }) {
  let content = fs.readFileSync(path.join(cwd, '../replaceman.config.js'), 'utf8');
  if (filter) content = content.replace('// filter logic', filter);
  if (replace) content = content.replace('// replace logic', replace);
  if (rename) content = content.replace('// rename logic', rename);
  if (exec) content = content.replace('// exec logic', exec);
  fs.writeFileSync(path.join(fixtureDirectory, 'replaceman.config.js'), content, 'utf-8');
}

describe('replaceman', () => {
  beforeEach(() => {
    run(`rm -rf ${fixtureDirectory}`);
    run(`mkdir ${fixtureDirectory}`);
  });

  it('replace and rename in folder', () => {
    fs.writeFileSync(path.join(fixtureDirectory, 'a.md'), 'hello world');
    fs.writeFileSync(path.join(fixtureDirectory, 'b.md'), 'hello mars, hello moon');
    fs.writeFileSync(path.join(fixtureDirectory, 'call.js'), 'hello earth');
    createConfigFile({
      filter: 'return /md$/.test(file)',
      replace: "return content.replaceAll('hello', 'halo')",
      rename: "console.log(name); return  name.replace('call', 'calls')" // shouldn't work because filter wont handle with js
    });
    run(`cd ${fixtureDirectory} && node ../../bin/replaceman`);
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'a.md'), 'utf8').trim(), 'halo world');
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'b.md'), 'utf8').trim(), 'halo mars, halo moon');
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'call.js'), 'utf8').trim(), 'hello earth');
  });

  it('rename in folder', () => {
    fs.writeFileSync(path.join(fixtureDirectory, 'a.md'), 'hello world');
    fs.writeFileSync(path.join(fixtureDirectory, 'b.md'), 'hello mars, hello moon');
    fs.writeFileSync(path.join(fixtureDirectory, 'call.js'), 'hello earth');
    createConfigFile({
      filter: 'return /js$/.test(file)',
      replace: "return content.replaceAll('hello', 'halo')", // shouldn't work because filter wont handle with md
      rename: "return  name.replace('call', 'calls')"
    });
    run(`cd ${fixtureDirectory} && node ../../bin/replaceman`);
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'a.md'), 'utf8').trim(), 'hello world');
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'b.md'), 'utf8').trim(), 'hello mars, hello moon');
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'calls.js'), 'utf8').trim(), 'halo earth');
    strictEqual(fs.existsSync(path.join(fixtureDirectory, 'call.js')), false);
  });

  it("don't handle with the config file it self", () => {
    fs.writeFileSync(path.join(fixtureDirectory, 'replacewoman.js'), 'hello earth');
    createConfigFile({
      filter: 'return /js$/.test(file)',
      replace: "return content.replaceAll('hello', 'halo')",
      rename: "return  name.replace('replace', 'rr')"
    });
    run(`cd ${fixtureDirectory} && node ../../bin/replaceman`);
    strictEqual(fs.existsSync(path.join(fixtureDirectory, 'replacewoman.js')), false);
    strictEqual(fs.existsSync(path.join(fixtureDirectory, 'replaceman.config.js')), true);
    strictEqual(fs.readFileSync(path.join(fixtureDirectory, 'rrwoman.js'), 'utf8').trim(), 'halo earth');
  });
});
