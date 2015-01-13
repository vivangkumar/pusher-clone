/**
 * activity_emit.js
 * TODO
 * @author Vivan
 */

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
  this.ft = ft;
 }

 var prototype = Emit.prototype;

 prototype.bind = function(eventName, callback, ctx) {
  this.callbacks.add(eventName, callback, ctx);
  return this;
 }

 prototype.unbind = function(eventName, callback, ctx) {
  this.callbacks.remove(eventName, callback, ctx);
  return this;
 }

 prototype.emit = function(eventName, data) {
  for(var i = 0; i < this.callbacks.length; i++) {
    this.callbacks[i](eventName, data);
  }

  var cb = this.callbacks.get(eventName);
  if(cb && cb.length > 0) {
    for(var i = 0; i < cb.length; i++) {
      cb[i].func.call(cb[i].ctx || window, data);
    }
  } else if(this.ft) {
    this.ft(eventName, data);
  }

  return this;
 };