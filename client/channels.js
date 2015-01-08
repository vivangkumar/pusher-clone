/**
 * Channels.js
 * @author Vivan
 */

function Channels() {
  this.channels = {};
}

Channels.prototype = {
  constructor: Channels,

  /**
   * Add new channel.
   * @param {string} name
   * @param {Object} Client
   * @return {Object} Channel Object
   */
  add: function(name, client) {
    if(!this.channels[name]) {
      this.channels[name] = new Channel(name, client);
    }
    return this.channels[name];
  },

  /**
   * Remove a channel from list of channels.
   * @param {string} name
   * @return {object} Channel object
   */
  remove: function(name) {
    var channel = this.channels[name];
    delete this.channels[name];

    return channel;
  }
};