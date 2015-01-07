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
}

Client.prototype = {
  constructor: Client,

  /**
   * Subscribe to channel.
   * @param {string} channel
   */
  subscribe: function(channel) {
    var self = this;

    // @TODO Refactor into response class
    var subscribeMessage = JSON.stringify({
      "event": "channel-subscribe",
      "channel_name": channel,
      "session_id": this.connection.sessionID
    });
    
    var connectionStatus = this.connection.getConnectionState();
    if(connectionStatus == 'connected') {
      this.socket.send(subscribeMessage);
    } else {
      setTimeout(function() {
        self.socket.send(subscribeMessage);
      }, 1000);
    }
  }
}
