# ReconnectingEventSource

This is a small wrapper library around the []JavaScript EventSource API](https://www.w3.org/TR/eventsource/) to
ensure it maintains a connection to the server. Normally, `EventSource` will reconnect on its own,
however there are some cases where it may not. This library ensures a reconnect always happens.

## Dependencies

You need to use a [polyfill for EventSource](https://github.com/Yaffle/EventSource) if you are targeting a browser that doesn't support it,
such as IE or Edge.

Additionally, if you need to support a browser that does not natively provide support for JSON (such as IE7 or lower),
then you should use the [json2.js polyfill](https://github.com/douglascrockford/JSON-js).

## Adding to your project

```
npm install reconnecting-eventsource
```

In a browser environment, bring this in using
```
<script src="/node_modules/reconnecting-eventsource/dist/ReconnectingEventSource[.min].js"></script>
```
(You are free to copy this file out of node_modules if you wish)

For node/browserify/webpack/etc, use
```
import ReconnectingEventSource from "reconnecting-eventsource";
```

## Usage

To use it, just replace:

```js
var es = new EventSource(url);
```

with:

```js
var es = new ReconnectingEventSource(url);
```

## When does the normal `EventSource` not reconnect?

Typically, the normal `EventSource` only reconnects if it is unable to reach the server at all.
However, if the server is reached and it responds with an error (e.g. 500 status), then `EventSource`
will stop reconnecting.

## Why reconnect if the server responds with an error?

Some errors, such as 502, are probably temporary, and ideally wouldn't cause client apps to break
and require user intervention to get them started again.

## So this thing reconnects forever. How do I make it stop?

The client has to explicitly stop by calling `es.close()`. If you want to control this from the
server, have the server send some kind of close instruction for the client to act on.
