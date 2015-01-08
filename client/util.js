/**
 * Util.js
 *
 * @author Vivan
 */

 var Util = {};

 /**
  * Encode messages in JSON.
  * @param {mixed} message
  * @return JSON
  */
 Util.encodeMessage = function(message) {
  return JSON.stringify(message);
 };