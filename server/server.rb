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
          puts "#{msg}"
        end

        ws.onclose do
          puts "Connection was closed by client."
        end
      end
    end
  end
end