/**
 * Channels.js
 * @author Vivan
 */

;(function() {
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
    add: function(name, pusherClone) {
      if(!this.channels[name]) {
        this.channels[name] = new PusherClone.Channel(name, pusherClone);
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

  PusherClone.Channels = Channels;
}).call(this);