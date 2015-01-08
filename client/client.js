/**
 * Instantiates a new socket connection.
 * @param {string} host
 * @param {integer} port
 */
function Client(host, port) {
  this.host = host;
  this.port = port;
  this.connection = new ConnectionManager(this.host, this.port);
  this.socket = this.connection.socket;
  this.channels = new Channels();
}

Client.prototype = {
  constructor: Client,

  /**
   * Subscribe to channel.
   * @param {string} channel
   * @return {object} Channel object
   */
  subscribe: function(channelName) {
    var self = this;
    var channel = this.channels.add(channelName, this);
    
    if(this.connection.connectionStatus == 'connected') {
      channel.subscribe();
    } else {
      setTimeout(function() {
        channel.subscribe();
      }, 1000);
    }

    return channel;
  },

  /**
   * Unsubscribe from a channel.
   * @param {string} channelName
   */
  unsubscribe: function(channelName) {
    var channel = this.channels.remove(channelName);
    if(this.connection.connectionStatus == 'connected') {
      channel.unsubscribe();
    }
  },

  /**
   * Send a new event.
   * @param {string} eventName
   * @param {mixed} data
   * @param {string} channel
   */
  sendEvent: function(eventName, data, channel) {
    return this.connection.sendEvent(eventName, data, channel);
  }
};
