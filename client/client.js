function Client(host, port) {
  this.host = host;
  this.port = port;
  this.connection = new ConnectionManager(this.host, this.port);
  this.socket = this.connection.socket;
}

Client.prototype = {
  constructor: Client
}
