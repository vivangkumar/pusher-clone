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