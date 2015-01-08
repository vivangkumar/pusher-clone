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
  this.events = {};
 }

 ConnectionManager.prototype = {
  constructor: ConnectionManager,

  /**
   * Retry limits.
   */
  limits: {
    time: 5000,
    bound: 5
  },
  
  /**
   * Establish websocket connection.
   * @param {string} host
   * @param {integer} port
   */
  connect: function(host, port) {
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
        var context = jsonData.data;
        // TODO
        var emit = new Emit();
        self.events[eventName] = emit;
        emit.emit(eventName, context)
        
        console.log(jsonData);
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
  },

  /**
   * Retry connection if host fails.
   */
  retryConnection: function() {
    var self = this;
    setTimeout(function() {
      self.connect(self.host, self.port);
    }, self.limits.time);
  },

  /**
   * Get current connection status.
   */
  getConnectionState: function() {
    return this.connectionStatus;
  },

  /**
   * Send a new event.
   * @param {string} name
   * @param {mixed} data
   * @param {string} channel
   */
  sendEvent: function(name, data, channel) {
    var message = {
      event: name,
      data: data
    };

    if(channel) {
      message.channel = channel;
    }

    return this.send(Util.encodeMessage(message));
  },

  /**
   * Send data.
   * @param {mixed} Data.
   */
  send: function(data) {
    if(this.connectionStatus == 'connected') {
      this.socket.send(data);
      return true;
    } else {
      return false;
    }
  }
};
/**
 * emit.js
 * TODO
 * @author Vivan
 */

 function Emit() {

 }

 var prototype = Emit.prototype;

 prototype.on = function(name, callback, context) {
  var emit = this.emit || (this.emit = {});
  (emit[name] || (emit[name] = [])).push({
    func: callback,
    context: context
  });

  return this;
 };

 prototype.emit = function(name) {
  var data = [].slice.call(arguments, 1);
  var eventArr = ((this.emit || (this.emit = {}))[name] || []).slice();
  for(var i = 0; i < eventArr.length; i++) {
    eventArr[i].func.apply(eventArr[i].context, data);
  }

  return this;
 };

 prototype.off = function(name, callback) {
  var emit = this.emit || (this.emit = {});
  var events = emit[name];
  var liveEvents = [];

  if(events && callback) {
    for(var i = 0, len = events.length; i < len; i++) {
      if(events[i].func !== callback) {
        liveEvents.push(events[i]);
      }
    }
  }
  liveEvents.length ? emit[name] = liveEvents : delete emit[name];

  return this;
 };
/**
 * Util.js
 *
 * @author Vivan
 */

 var Util = {};

 /**
  * Encode messages in JSON.
  * @param {mixed} message
  * @return JSON
  */
 Util.encodeMessage = function(message) {
  return JSON.stringify(message);
 };