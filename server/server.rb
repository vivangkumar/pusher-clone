# Server powered by Event machine.
# Uses web sockets. em-websocket
# @author Vivan

require 'em-websocket'
require 'eventmachine'
require 'em-hiredis'
require 'json'
require_relative 'response.rb'

module CloneServer

  # Main server function.
  # Runs the server locally on port 8080
  def self.run_server
    EM.run do
      redis = EM::Hiredis.connect
      EM::WebSocket.run(:host => '127.0.0.1', :port => 8080 ) do |ws|
        ws.onopen { |handshake|
          puts "New client connected."
          ws.send(CloneResponse.event(
            CloneResponse::CONNECTION_SUCCEEDED_EVENT_REPLY, {
              "message" => "Connection established."
            }).to_json)
        }

        ws.onmessage do |msg|
          handle_messages(msg, redis, ws)
        end

        ws.onclose do
          redis.close_connection
          puts "Connection was closed by client."
        end
      end
    end
  end

  # Handle incoming messages based on events.
  #
  # param {json} msg - Incoming message
  # param {object} redis - Redis connection instance
  # param {object} ws - Current websocket  
  def self.handle_messages(msg, redis, ws)
    msg = JSON.parse(msg)
    event = msg["event"]
    data = msg["data"]

    if event == CloneResponse::SUBSCRIBE_TO_CHANNEL_EVENT
      channel = data["channel"]
      subscribe_channel(channel, redis, ws)
    end

    if event == CloneResponse::UNSUBSCRIBE_TO_CHANNEL_EVENT
      channel = data["channel"]
      unsubscribe_channel(channel, redis, ws)
    end
  end

  # Subscribe to channels.
  # Uses the redis pub sub model.
  #
  # param {string} channel - Channel to subscribe
  # param {object} redis - Redis instance
  # param {object} ws - Current websocket
  def self.subscribe_channel(channel, redis, ws)
    ws.send(CloneResponse.event(
      CloneResponse::SUBSCRIBE_REPLY, {
        "channel" => channel
      }).to_json);
    callback = Proc.new { |msg|
      ws.send(msg)
    }
    sub = redis.pubsub.subscribe(channel, callback)
  end

  # Unsubscribe to channels.
  # Uses the redis pub sub model.
  #
  # param {string} channel - Channel to subscribe
  # param {object} redis - Redis instance
  # param {object} ws - Current websocket
  def self.unsubscribe_channel(channel, redis, ws)
    ws.send(CloneResponse.event(
      CloneResponse::UNSUBSCRIBE_REPLY, {
        "channel" => channel
      }).to_json);
    redis.pubsub.unsubscribe(channel)
  end
end