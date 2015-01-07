function ConnectionManager(host, port) {
  this.host = host;
  this.port = port;
  this.tries = 0;
  this.sessionID = Math.floor(Math.random() * 1000000000);
  this.connect(this.host, this.port);
  this.connectionStatus = '';
 }

 ConnectionManager.prototype = {
  constructor: ConnectionManager,

  limits: {
    time: 5000,
    bound: 5
  },
  
  connect: function(host, port) {
    var self = this;
    var connectionUri = "ws://" + host + ":" + port;
    try {
      this.connectionStatus = 'connecting';
      this.socket = new WebSocket(connectionUri);

      this.socket.onopen = function() {
        this.connectionStatus = 'connected';
        console.log("Socket opened. Session ID: "+self.sessionID);
        self.tries = 0;
      }
      this.socket.onmessage = function(msg) {
        console.log(msg.data);
      }
      this.socket.onclose = function() {
        this.connectionStatus = 'closed';
        console.log("Connection closed by host.");
        console.log("Retrying in "+(self.limits.time / 1000)+" seconds.");

        if(self.tries < self.limits.bound) {
          self.tries++;
          console.log("Attempt "+self.tries+" - Retrying...");
          self.retryConnection();
        } else {
          console.log("Max retries reached.");
        }
      }
      this.socket.onerror = function (error) {
        console.error("Unidentified WebSocket error.");
      }
    } catch(e) {
      console.log("Unexpected WebSocket error." +e);
    }
  },

  retryConnection: function() {
    var self = this;
    setTimeout(function() {
      self.connect(self.host, self.port);
    }, self.limits.time);
  },

  getConnectionState: function() {
    return this.connectionStatus;
  } 
}