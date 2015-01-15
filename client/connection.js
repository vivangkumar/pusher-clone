;(function() {
    /**
     * Handle connections and web socket functions.
     * @param {string} host
     * @param {integer} port
     */
    function ConnectionManager(host, port) {
    this.host = host;
    this.port = port;
    this.tries = 0;
    this.sessionID = Math.floor(Math.random() * 1000000000);
    this.connect(this.host, this.port);
    this.connectionStatus = '';
    PusherClone.Emit.call(this);
   }

   var prototype = ConnectionManager.prototype;
   PusherClone.Util.extend(prototype, PusherClone.Emit.prototype);

   /**
    * Retry limits.
    */
   prototype.limits = {
    time: 5000,
    bound: 5
   };

   /**
    * Establish websocket connection.
    * Also has listeners for websocket events.
    *
    * @param {string} host
    * @param {integer} port
    */
   prototype.connect = function(host, port) {
    var self = this;
    var connectionUri = "ws://" + host + ":" + port;

    try {
      this.connectionStatus = 'connecting';
      this.socket = new WebSocket(connectionUri);

      this.socket.onopen = function() {
        self.connectionStatus = 'connected';
        console.log("Socket opened. Session ID: "+self.sessionID);
        self.tries = 0;
      }

      this.socket.onmessage = function(msg) {
        msg = msg.data;
        var jsonData = JSON.parse(msg);
        var eventName = jsonData.event;
        var data = jsonData.data;
        /** TODO **/
        self.emit(eventName, data);
      }

      this.socket.onclose = function() {
        self.connectionStatus = 'closed';
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
  };

  /**
   * Retry connection if host fails.
   */
  prototype.retryConnection = function() {
    var self = this;
    setTimeout(function() {
      self.connect(self.host, self.port);
    }, self.limits.time);
  };

  /**
   * Send a new event.
   * @param {string} name
   * @param {mixed} data
   * @param {string} channel
   *
   * @return boolean
   */
  prototype.sendEvent = function(name, data, channel) {
    var message = {
      event: name,
      data: data
    };

    if(channel) {
      message.channel = channel;
    }

    return this.send(PusherClone.Util.encodeMessage(message));
  };

  /**
   * Send data.
   * @param {mixed} Data.
   *
   * @return boolean
   */
  prototype.send = function(data) {
    if(this.connectionStatus == 'connected') {
      this.socket.send(data);
      return true;
    } else {
      return false;
    }
  };

  PusherClone.ConnectionManager = ConnectionManager;
}).call(this);