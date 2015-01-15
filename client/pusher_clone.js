;(function() {
  /**
   * Instantiates a new socket connection.
   * @param {string} host
   * @param {integer} port
   */
  function PusherClone(host, port) {
    this.host = host;
    this.port = port;
    this.connection = new PusherClone.ConnectionManager(this.host, this.port);
    this.socket = this.connection.socket;
    this.channels = new PusherClone.Channels();
    this.emitter = new PusherClone.Emit();
  }

  PusherClone.prototype = {
    constructor: PusherClone,

    /**
     * Subscribe to channel.
     * @param {string} channel
     *
     * @return {object} Channel
     */
    subscribe: function(channelName) {
      var self = this;
      var channel = this.channels.add(channelName, this);
      
      if(this.connection.connectionStatus == 'connected') {
        channel.subscribe();
        return channel;
      } else {
        setTimeout(function() {
          channel.subscribe();
        }, 1000);

        return channel;
      }
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
     *
     * @return object
     */
    sendEvent: function(eventName, data, channel) {
      return this.connection.sendEvent(eventName, data, channel);
    },

    bind: function(eventName, callback) {
      this.emitter.bind(eventName, callback);
      return this;
    },
  };

  this.PusherClone = PusherClone;
}).call(this);

