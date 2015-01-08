/**
 * Channel.js
 *
 * @author Vivan
 */
function Channel(name, client) {
  this.name = name;
  this.subscribed = false;
  this.client = client;
  this.connection = this.client.connection;
  this.events = this.connection.events;
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
  },
  /** TODO */
  bind: function(eventName, callback) {
    for(var e in this.events) {
      if(e == eventName) {
        this.events[e].on(eventName, callback);
      }
    }
  }
};

