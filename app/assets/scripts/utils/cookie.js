// ======================================================================== //
//  Cookie library                                                          //
// ======================================================================== //

/**
 * Creates a cookie.
 * @param string name
 * @param string value
 * @param int days
 */
module.exports.create = function (name, value, days, path) {
  path = path || '/';
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toGMTString();
  }
  document.cookie = name + '=' + value + expires + '; path=' + path;
};

/**
 * Reads a cookie value with the given name.
 * @param string name
 * @return mixed
 *   Cookie value or null.
 */
module.exports.read = function (name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

/**
 * Deletes a cookie with the given name.
 * @param string name
 */
module.exports.erase = function (name, path) {
  path = path || '/';
  module.exports.createCookie(name, '', -1, path);
};
