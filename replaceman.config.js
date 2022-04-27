module.exports = {
  /**
    * Filter files.
    * Return `true` if don't want to do any filtering but it would be quite dangerous.
    * Better run with --dry before serious actions.
    * */
  filter: function (file) {
    // filter logic
    return /md$/.test(file);
  },
  /**
   * replace content with returned value
   * */
  replace: function (content) {
    // replace logic
    return content.replaceAll('non-sense-string-for-content??!!)(*&@$%^%$#', 'replaced-nonsense');
  },
  /**
   * rename files.
   * note: the paramters name the filename without path info.
   * */
  rename: function (name) {
    // rename logic
    return name.replace('<<file-name-wont-exists>>', '<<non-sense-string>>');
  },
  /**
   * exec command on files.
   * note:
   *   absFilePath: absolute file path of the file
   * return:
   *   If you return empty string, null or undefined, nothing will be executed.
   *   Any string you return will be executed as command.
   * */
  exec: function (absFilePath) {
    // exec logic
    return `ls ${absFilePath}`;
  }
};
