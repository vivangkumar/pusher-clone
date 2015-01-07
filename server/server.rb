# Server powered by Event machine.
# Uses web sockets. em-websocket
# @author Vivan

require 'em-websocket'
require 'eventmachine'
require 'em-hiredis'
require 'json'
require_relative 'response.rb'

module CloneServer

  # Run event machine server on port 8080
  def self.run_server
    EM.run do
      EM::WebSocket.run(:host => '127.0.0.1', :port => 8080 ) do |ws|
        ws.onopen { |handshake|
          puts "New client connected."
          ws.send(CloneResponse::CONNECTION_SUCCESS.to_json)
        }

        ws.onmessage do |msg|
          json_msg = JSON.parse(msg)
          event = json_msg["event"]
          session_id = json_msg["session_id"]
          
          if event == "channel-subscribe" 
            channel = json_msg["channel_name"]
            puts "#{channel}"
          end
        end

        ws.onclose do
          puts "Connection was closed by client."
        end
      end
    end
  end
end