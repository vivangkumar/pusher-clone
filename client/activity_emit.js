/**
 * activity_emit.js
 * TODO
 * @author Vivan
 */

 ;(function() {
    /**
     * Callback helper.
     * Stores callbacks in object.
     */
    function CallbackStore() {
    this._callbacks = {};
   }

   /**
    * Add a new callback to the store.
    * 
    * @param {string} eventName
    * @param {function} callback
    * @param {object} ctx
    */
   CallbackStore.prototype.add = function(eventName, callback, ctx) {
    this._callbacks[eventName] = this._callbacks[eventName] || [];
    this._callbacks[eventName].push({
      func: callback,
      context: ctx
    });
   };

   /**
    * Remove a callback.
    *
    * @param {string} eventName
    * @param {function} callback
    * @param {object} ctx
    *
    * @return CallbackStore
    */
   CallbackStore.prototype.remove = function(eventName, callback, ctx) {
    if(1 == arguments.length) {
      delete this._callbacks[eventName];
      return this;
    }
   };

   /**
    * Retrieve a callback from the store.
    *
    * @param {string} eventName
    *
    * @return callback
    */
   CallbackStore.prototype.get = function(eventName) {
    return this._callbacks[eventName];
   }

   /**
    * Emit class.
    * Handles event emitting and binding.
    *
    * @param {object} ft
    */
   function Emit(ft) {
    this.callbacks = new CallbackStore();
    this.globalCallbacks = [];
    this.ft = ft;
   }

   /**
    * Bind to an event.
    *
    * @param {string} eventName
    * @param {function} callback
    * @param {object} ctx
    *
    * @return Emit
    */
   Emit.prototype.bind = function(eventName, callback, ctx) {
    this.callbacks.add(eventName, callback, ctx);
    return this;
   }

   /**
    * Unbind from an event.
    *
    * @param {string} eventName
    * @param {function} callback
    * @param {object} ctx
    *
    * @return Emit
    */
   Emit.prototype.unbind = function(eventName, callback, ctx) {
    this.callbacks.remove(eventName, callback, ctx);
    return this;
   }

   /**
    * Emit an event.
    *
    * @param {string} eventName
    * @param {mixed} data
    * 
    * @return Emit
    */
   Emit.prototype.emit = function(eventName, data) {
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