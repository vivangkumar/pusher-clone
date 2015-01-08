# Response module

module CloneResponse
  def self.event(event, data)
    return {
      "event" => event,
      "data" => data
    }
  end
  CONNECTION_SUCCEEDED_EVENT_REPLY = "connection_succeeded"
  SUBSCRIBE_TO_CHANNEL_EVENT = "client:subscribe"
  UNSUBSCRIBE_TO_CHANNEL_EVENT = "client:unsubscribe"
  UNSUBSCRIBE_REPLY = "channel_unsubscribed"
  SUBSCRIBE_REPLY = "channel_subscribed"
end