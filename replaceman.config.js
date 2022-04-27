module.exports = {
  /* filter files */
  filter: function(file) {
    return /md$/.test(file);
  },
  /* replace content with returned value */
  replace: function(content) {
    return content.replaceAll('abcx', "ABCx");
  },
  /**
   * rename files.
   * note: the paramters name the filename without path info.
   * */
  rename: function(name) {
    return name.replace('<<file-name-wont-exists>>', "cffffff");
  },
}
