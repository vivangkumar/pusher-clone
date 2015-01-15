/**
 * Channel.js
 *
 * @author Vivan
 */
;(function() {
    /**
     * Channel class.
     * Describes a single channel.
     * @param {string} name
     * @param {object} pusherClone
     */
    function Channel(name, pusherClone) {
    this.name = name;
    this.subscribed = false;
    this.pusherClone = pusherClone;
    this.connection = this.pusherClone.connection;
    PusherClone.Emit.call(this);
  }

  var prototype = Channel.prototype;
  PusherClone.Util.extend(prototype, PusherClone.Emit.prototype);

  /**
   * Subscribe to a channel.
   */
  prototype.subscribe = function() {
    this.subscribed = true;
    this.pusherClone.sendEvent('client:subscribe', {
      channel: this.name
    });
  };

  /**
   * Unsubscribe from a channel
   */
  prototype.unsubscribe = function() {
    this.subscribed = false;
    this.pusherClone.sendEvent('client:unsubscribe', {
      channel: this.name
    });
  };

  PusherClone.Channel = Channel;
}).call(this);