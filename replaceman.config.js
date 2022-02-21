module.exports = {
  /**
   * Replaceman will automatically run the `replace` method in a loop
   * until no further changes if autoLoop is true.
   */
  autoLoop: true, 
   /**
    * Filter files. 
    * Return `true` if don't want to do any filtering but it would be quite dangerous.
    * Better run with --dry before serious actions.
    * */
  filter: function(file) {
    return /md$/.test(file);
  },
  /** 
   * replace content with returned value 
   * autoLoop only make sense for this method.
   * */
  replace: function(content) {
    return content.replace('non-sense-string-for-content??!!)(*&@$%^%$#', "replaced");
  },
  /**
   * rename files.
   * note: the paramters name the filename without path info.
   * */
  rename: function(name) {
    return name.replace('non-sense-string-for-filename', "no-way");
  },
  /**
   * exec command on files.
   * note:
   *   absFilePath: absolute file path of the file
   * return:
   *   If you return empty string, null or undefined, nothing will be executed.
   *   Any string you return will be executed as command.
   * */
   exec: function(absFilePath) {
    return `ls ${absFilePath}`;
  },
}
