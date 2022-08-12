// MIT License:
//
// Copyright (C) 2022 Fanout, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

export interface ReconnectingEventSourceInit extends EventSourceInit {
    // the maximum time to wait before attempting to reconnect in ms, default `3000`
    // note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
    max_retry_time?: number;

    // the EventSource class to wrap. This allows the use of a polyfill or alternate
    // implementation instead of the platform-provided EventSource class.
    eventSourceClass?: typeof EventSource;

    // the last event
    lastEventId?: string;
}

export class EventSourceNotAvailableError extends Error {
    constructor() {
        super(
          'EventSource not available.\n' +
          'Consider loading an EventSource polyfill and making it available globally as EventSource, ' +
          'or passing one in as eventSourceClass to the ReconnectingEventSource constructor.'
        );
    }
}

type EventType<T extends string> = T extends keyof EventSourceEventMap ? EventSourceEventMap[T] : MessageEvent<any>;
type EventListenerType<T extends string> = (this: EventSource, event: EventType<T>) => any;

type Listeners = {
  [name: string]: ((this: EventSource, event: Event) => any)[];
};

export default class ReconnectingEventSource implements EventSource {

    readonly _configuration: ReconnectingEventSourceInit | undefined;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSED = 2;

    _eventSource: EventSource | null;
    _lastEventId: string | null;
    _timer: NodeJS.Timer | null;
    _listeners: Listeners;
    _onevent_wrapped: (this: EventSource, ev: Event) => any;

    readyState: 0 | 1 | 2;
    url: string;
    withCredentials: boolean;

    readonly max_retry_time: number;
    eventSourceClass: typeof EventSource;

    constructor(url: string | URL, configuration?: ReconnectingEventSourceInit) {
        this._configuration = configuration != null ? Object.assign({}, configuration) : undefined;
        this.withCredentials = false;

        this._eventSource = null;
        this._lastEventId = null;
        this._timer = null;
        this._listeners = {};

        this.url = url.toString();
        this.readyState = this.CONNECTING;
        this.max_retry_time = 3000;
        this.eventSourceClass = globalThis.EventSource;

        if (this._configuration != null) {
            if (this._configuration.lastEventId) {
                this._lastEventId = this._configuration.lastEventId;
                delete this._configuration['lastEventId'];
            }

            if (this._configuration.max_retry_time) {
                this.max_retry_time = this._configuration.max_retry_time;
                delete this._configuration['max_retry_time'];
            }

            if (this._configuration.eventSourceClass) {
                this.eventSourceClass = this._configuration.eventSourceClass;
                delete this._configuration['eventSourceClass'];
            }
        }

        if(this.eventSourceClass == null || typeof this.eventSourceClass !== 'function') {
            throw new EventSourceNotAvailableError();
        }

        this._onevent_wrapped = (event) => { this._onevent(event); };

        this._start();
    }

    dispatchEvent(event: Event): boolean {
        throw new Error("Method not implemented.");
    }

    _start() {
        let url = this.url;

        if (this._lastEventId) {
            if (url.indexOf('?') === -1) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'lastEventId=' + encodeURIComponent(this._lastEventId);
        }

        this._eventSource = new this.eventSourceClass(url, this._configuration);

        this._eventSource.onopen = (event) => { this._onopen(event); };
        this._eventSource.onerror = (event) => { this._onerror(event); };
        this._eventSource.onmessage = (event) => { this.onmessage(event); };

        // apply listen types
        for (const type of Object.keys(this._listeners)) {
            this._eventSource.addEventListener(type, this._onevent_wrapped);
        }
    }

    _onopen(event: Event) {
        if (this.readyState === 0) {
            this.readyState = 1;
            this.onopen(event);
        }
    }

    _onerror(event: Event) {
        if (this.readyState === 1) {
            this.readyState = 0;
            this.onerror(event);
        }

        if (this._eventSource) {
            if(this._eventSource.readyState === 2) {
                // reconnect with new object
                this._eventSource.close();
                this._eventSource = null;

                // reconnect after random timeout < max_retry_time
                const timeout = Math.round(this.max_retry_time * Math.random());
                this._timer = setTimeout(() => this._start(), timeout);
            }
        }
    }

    _onevent(event: Event) {
        if (event instanceof MessageEvent) {
            this._lastEventId = event.lastEventId;
        }

        const listenersForType = this._listeners[event.type];
        if (listenersForType != null) {
            // operate on a copy
            for (const listener of [...listenersForType]) {
                listener.call(this, event);
            }
        }

        if (event.type === 'message') {
            this.onmessage(event as MessageEvent);
        }
    }

    onopen(event: Event) {
        // may be overridden
    }

    onerror(event: Event) {
        // may be overridden
    }

    onmessage(event: MessageEvent) {
        // may be overridden
    }

    close() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        if (this._eventSource) {
            this._eventSource.close();
            this._eventSource = null;
        }

        this.readyState = 2;
    }

    addEventListener<K extends keyof EventSourceEventMap>(type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: (this: EventSource, event: MessageEvent<any>) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener<K extends string>(type: K, listener: EventListenerType<K>, options?: boolean | AddEventListenerOptions): void {
        // We don't support the options arg at the moment

        if (!(type in this._listeners)) {
            this._listeners[type] = [];
            if (this._eventSource != null) {
                this._eventSource.addEventListener(type, this._onevent_wrapped);
            }
        }

        const listenersForType = this._listeners[type] as EventListenerType<K>[];
        if (Array.isArray(listenersForType) && !listenersForType.includes(listener)) {
            listenersForType.push(listener);
        }
    }

    removeEventListener<K extends keyof EventSourceEventMap>(type: K, listener: (this: EventSource, ev: EventSourceEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: (this: EventSource, event: MessageEvent<any>) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener<K extends string>(type: K, listener: EventListenerType<K>, options?: boolean | EventListenerOptions): void {
        // We don't support the options arg at the moment

        const listenersForType = this._listeners[type] as EventListenerType<K>[];
        if (listenersForType != null) {
            // eslint-disable-next-line no-constant-condition
            while(true) {
                const index = listenersForType.indexOf(listener);
                if (index === -1) {
                    break;
                }
                listenersForType.splice(index, 1);
            }

            if (listenersForType.length <= 0) {
                delete this._listeners[type];
                if (this._eventSource != null) {
                    this._eventSource.removeEventListener(type, this._onevent_wrapped);
                }
            }
        }
    }
}
