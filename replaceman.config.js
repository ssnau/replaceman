module.exports = {
  autoLoop: true, // Replaceman will automatically run the `replace` method in a loop until no further changes if autoLoop is true.
  /* filter files */
  filter: function(file) {
    return /md$/.test(file);
  },
  /* replace content with returned value */
  replace: function(content) {
    return content.replace('abcx', "ABCx");
  },
  /**
   * rename files.
   * note: the paramters name the filename without path info.
   * */
  rename: function(name) {
    return name.replace('ffffffc', "cffffff");
  },
}
