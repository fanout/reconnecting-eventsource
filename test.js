EventSource = require('eventsource');
const ReconnectingEventSource = require('.').default;
const http = require('http');
const SSE = require('sse');
const stoppable = require('stoppable');
const EventEmitter = require('events').EventEmitter;

// Return an EventEmitter that emits an event named 'event' every second
const clockEvents = () => {
  const events = new EventEmitter;
  const emitSecond = () => events.emit('event', new Date);
  emitSecond();
  const interval = setInterval(emitSecond, 1000);
  return {
    events,
    destroy: () => {
      clearInterval(interval);
      events.removeAllListeners();
    }
  };
};

// Return an HTTP server that serves SSE at /sse
const createSseServer = (eventEmitter, name) => {
  const server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('server-sent events are at /sse');
  });
  const sseServer = new SSE(server);
  sseServer.on('connection', function(client) {
    const listener = (event) => {
      client.send(`${name || 'sseServer'}: ${String(event)}`);
    };
    eventEmitter.addListener('event', listener);
    client.once('close', () => {
      eventEmitter.removeListener('event', listener);
    });
  });
  return server;
};

const onceEvent = (eventTarget, eventName) => new Promise((resolve, reject) => {
  const onceEventListener = function(event) {
    eventTarget.removeEventListener(eventName, onceEventListener);
    return resolve(event);
  };
  eventTarget.addEventListener(eventName, onceEventListener);
});

const main = async () => {
  const clock = clockEvents();

  // Create server1
  const server1 = stoppable(createSseServer(clock.events, 'server1'), 0);
  await new Promise(async (resolve, reject) => {
    server1.listen(0, (error) => error ? reject(error) : resolve());
  });
  const server1Port = server1.address().port;
  const server1SseUrl = `http://localhost:${server1.address().port}/sse`;

  // Set up Eventsource
  const eventSource = new ReconnectingEventSource(server1SseUrl);
  eventSource.addEventListener('error', (error) => {
    console.error('eventSource error', error);
  });
  eventSource.addEventListener('open', () => {
    console.debug('eventSource open');
  });

  // await an event
  const event1 = await onceEvent(eventSource, 'message');
  console.debug('event1', event1.data);

  // Close server1, triggering reconnect
  console.debug('Closing server1');
  await new Promise((resolve, reject) => {
    server1.stop(error => error ? reject(error) : resolve());
  });
  console.debug('server1 closed');
  
  // Make server2, which eventSource should reconnect to
  const server2 = createSseServer(clock.events, 'server2');
  const server2Port = server1Port;
  await new Promise(async (resolve, reject) => {
    server2.listen(server2Port, (error) => error ? reject(error) : resolve());
  });
  console.debug('server2 is listening');

  // we should have reconnected and be able to get an event
  const event2 = await onceEvent(eventSource, 'message');
  console.debug('event2', event2.data);
  server2.close();

  // clean up
  eventSource.close();
  clock.destroy();

  // test construction with config
  const eventSource2 = new ReconnectingEventSource(server1SseUrl, {
    lastEventId: 'abc',
    max_retry_time: 5000,
  });
  eventSource2.close();
};

if (require.main === module) {
  main().catch((error) => { throw error; });
}
