import ReconnectingEventSource, { EventSourceNotAvailableError } from './reconnecting-eventsource';
Object.assign(window, {
  ReconnectingEventSource,
  EventSourceNotAvailableError,
});
