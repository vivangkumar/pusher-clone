/**
 * Util.js
 *
 * @author Vivan
 */

 ;(function() {
  var Util = {};

  /**
  * Encode messages in JSON.
  * @param {mixed} message
  * @return JSON
  */
  Util.encodeMessage = function(message) {
    return JSON.stringify(message);
  };

  Util.extend = function(firstObject) {
    for(var i = 0; i < arguments.length; i++) {
      var ext = arguments[1];
      for(var prop in ext) {
        if(ext[prop] && ext[prop].constructor && 
          ext[prop].constructor == Object) {
          firstObject[prop] = Util.extend(
            firstObject[prop] || {}, ext[prop]);
        } else {
          firstObject[prop]= ext[prop];
        }
      }
    }
    return firstObject;
  };

  PusherClone.Util = Util;
}).call(this);