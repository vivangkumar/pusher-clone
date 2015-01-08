/**
 * Channel.js
 *
 * @author Vivan
 */
function Channel(name, client) {
  this.name = name;
  this.subscribed = false;
  this.client = client;
}

Channel.prototype = {
  constructor: Channel,

  /**
   * Subscribe to a channel.
   */
  subscribe: function() {
    this.subscribed = true;
    this.client.sendEvent('client:subscribe', {
      channel: this.name
    });
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe: function() {
    this.subscribed = false;
    this.client.sendEvent('client:unsubscribe', {
      channel: this.name
    });
  }
};

