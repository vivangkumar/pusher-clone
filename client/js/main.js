/**
 * Instantiates a new socket connection.
 * @param {string} host
 * @param {integer} port
 */
;(function() {
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
     * @return {object} Channel object
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
     */
    sendEvent: function(eventName, data, channel) {
      return this.connection.sendEvent(eventName, data, channel);
    },

    bind: function(eventName, callback) {
      this.emitter.bind(eventName, callback);
      return this;
    }
  };

  this.PusherClone = PusherClone;
}).call(this);


/**
 * Util.js
 *
 * @author Vivan
 */

 ;(function() {
  var Util = {};

  /**
  * Encode messages in JSON.
  * @param {mixed} message
  * @return JSON
  */
  Util.encodeMessage = function(message) {
    return JSON.stringify(message);
  };

  Util.extend = function(firstObject) {
    for(var i = 0; i < arguments.length; i++) {
      var ext = arguments[1];
      for(var prop in ext) {
        if(ext[prop] && ext[prop].constructor && 
          ext[prop].constructor == Object) {
          firstObject[prop] = Util.extend(
            firstObject[prop] || {}, ext[prop]);
        } else {
          firstObject[prop]= ext[prop];
        }
      }
    }
    return firstObject;
  };

  PusherClone.Util = Util;
}).call(this);

/**
 * activity_emit.js
 * TODO
 * @author Vivan
 */

 ;(function() {
    function CallbackStore() {
    this._callbacks = {};
   }

   CallbackStore.prototype.add = function(eventName, callback, ctx) {
    this._callbacks[eventName] = this._callbacks[eventName] || [];
    this._callbacks[eventName].push({
      func: callback,
      context: ctx
    });
   };

   CallbackStore.prototype.remove = function(eventName, callback, ctx) {
    if(1 == arguments.length) {
      delete this._callbacks[eventName];
      return this;
    }
   };

   CallbackStore.prototype.get = function(eventName) {
    return this._callbacks[eventName];
   }

   function Emit(ft) {
    this.callbacks = new CallbackStore();
    this.globalCallbacks = [];
    this.ft = ft;
   }

   Emit.prototype.bind = function(eventName, callback, ctx) {
    this.callbacks.add(eventName, callback, ctx);
    return this;
   }

   Emit.prototype.unbind = function(eventName, callback, ctx) {
    this.callbacks.remove(eventName, callback, ctx);
    return this;
   }

   Emit.prototype.emit = function(eventName, data) {
    console.log(eventName);
    var i;
    for(i = 0; i < this.globalCallbacks.length; i++) {
      this.globalCallbacks[i](eventName, data);
    }

    var cb = this.callbacks.get(eventName);
    if(cb && cb.length > 0) {
      for(i = 0; i < cb.length; i++) {
        cb[i].func.call(cb[i].ctx || window, data);
      }
    } else if(this.ft) {
      this.ft(eventName, data);
    }

    return this;
   };

   PusherClone.Emit = Emit;
 }).call(this);
/**
 * Channel.js
 *
 * @author Vivan
 */
;(function() {
    function Channel(name, pusherClone) {
    this.name = name;
    this.subscribed = false;
    this.pusherClone = pusherClone;
    this.connection = this.pusherClone.connection;
    PusherClone.Emit.call(this);
  }

  var prototype = Channel.prototype;
  PusherClone.Util.extend(prototype, PusherClone.Emit.prototype);

  prototype.subscribe = function() {
    this.subscribed = true;
    this.pusherClone.sendEvent('client:subscribe', {
      channel: this.name
    });
  };

  prototype.unsubscribe = function() {
    this.subscribed = false;
    this.pusherClone.sendEvent('client:unsubscribe', {
      channel: this.name
    });
  };

  PusherClone.Channel = Channel;
}).call(this);
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
/**
 * Handle connections and web socket functions.
 * @param {string} host
 * @param {integer} port
 */
;(function() {
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
