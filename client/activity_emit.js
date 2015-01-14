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