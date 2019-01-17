EventSource = require('eventsource')
const ReconnectingEventSource = require('reconnecting-eventsource').default
const sseUrl = "https://example.com/events" // will 404
const eventSource = new ReconnectingEventSource(sseUrl, {});
eventSource.addEventListener('error', (error) => {
  console.error('eventSource error', error)
})
eventSource.addEventListener('message', function(ev) {
  console.log('id: ', ev.lastEventId);
  console.log('message: ', ev.data);
});
