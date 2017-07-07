# ReconnectingEventSource

This is a small wrapper library around the JavaScript EventSource API to ensure it maintains a connection to the server. Normally, EventSource will reconnect on its own, however there are some cases where it may not. This library ensures a reconnect always happens.

To use it, just replace:

```js
var es = new EventSource(url);
```

with:

```js
var es = new ReconnectingEventSource(url);
```

## When does the normal EventSource not reconnect?

Typically, the normal EventSource only reconnects if it is unable to reach the server at all. However, if the server is reached and it responds with an error (e.g. 500 status), then EventSource will stop reconnecting.

## Why reconnect if the server responds with an error?

Some errors, such as 502, are probably temporary, and ideally wouldn't cause client apps to break and require user intervention to get them started again.

## So this thing reconnects forever. How do I make it stop?

The client has to explicitly stop by calling `es.close()`. If you want to control this from the server, have the server send some kind of close instruction for the client to act on.
