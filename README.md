# ReconnectingEventSource

This is a small wrapper library around the [JavaScript EventSource API](https://www.w3.org/TR/eventsource/) to ensure it maintains a connection to the server. Normally, `EventSource` will reconnect on its own, however there are some cases where it may not. This library ensures a reconnect always happens.

To use it, just replace:

```js
var es = new EventSource(url);
```

with:

```js
var es = new ReconnectingEventSource(url);
```

## Adding to your project

```sh
npm install reconnecting-eventsource
```

In a browser environment, bring this in using:

```html
<script src="/node_modules/reconnecting-eventsource/dist/ReconnectingEventSource.min.js"></script>
```

(You are free to copy this file out of `node_modules` if you wish)

For node/browserify/webpack/etc, use:

```js
import ReconnectingEventSource from "reconnecting-eventsource";
```

Note: This project assumes you have a working `EventSource` available. If you are targeting a browser that doesn't support it, such as IE or Edge, you'll need to use a [polyfill for EventSource](https://github.com/Yaffle/EventSource).

## Configuration

Like the [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource#Syntax), the constructor takes an optional configuration object: `new ReconnectingEventSource(url, configuration)`. The configuration object is passed through to the underlying `EventSource` and can optionally include the following configuration:

```json5
{
    // indicating if CORS should be set to include credentials, default `false`
    withCredentials: false,

    // the maximum time to wait before attempting to reconnect in ms, default `3000`
    // note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
    max_retry_time: 3000,

    // underlying EventSource class, default `EventSource`
    eventSourceClass: EventSource,
}
```

## Building from source

If you wish to build this project, check out this repository and modify the source files in `src/`. Then, run the following command:

```sh
npm run build
```

The resulting files are in `lib/` for the node build and `dist/` for the browser build.

## When does the normal `EventSource` not reconnect?

Typically, the normal `EventSource` only reconnects if it is unable to reach the server at all. However, if the server is reached and it responds with an error (e.g. 500 status), then `EventSource` will stop reconnecting.

## Why reconnect if the server responds with an error?

Some errors, such as 502, are probably temporary, and ideally wouldn't cause client apps to break and require user intervention to get them started again.

## So this thing reconnects forever. How do I make it stop?

The client has to explicitly stop by calling `es.close()`. If you want to control this from the server, have the server send some kind of close instruction for the client to act on.

## Compatibility

Browsers
* Chrome / Chrome Android 71 and newer
* Edge 79 and newer
* Safari 12.2 and newer
* Firefox / Firefox Android 65 and newer
* Firefox Android 65 or newer
* Opera 58 and newer
* Opera Android 50 and newer

Server
* Node.js 12.0 and newer
* Deno 1.38 and newer
