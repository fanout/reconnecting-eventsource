// MIT License:
//
// Copyright (C) 2017 Fanout, Inc.
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

export default class ReconnectingEventSource {

    constructor(url, configuration) {
        this._configuration = configuration != null ? Object.assign({}, configuration) : null;
        this._eventSourceClass = EventSource;

        this._eventSource = null;
        this._lastEventId = null;
        this._timer = null;
        this._listeners = {};

        this.url = url;
        this.readyState = 0;
        this.max_retry_time = 3000;

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
                this._eventSourceClass = this._configuration.eventSourceClass;
                delete this._configuration['eventSourceClass'];
            }
        }

        this._onevent_wrapped = event => { this._onevent(event); };

        this._start();
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

        this._eventSource = new this._eventSourceClass(url, this._configuration);

        this._eventSource.onopen = event => { this._onopen(event); };
        this._eventSource.onerror = event => { this._onerror(event); };
        this._eventSource.onmessage = event => { this.onmessage(event); };

        // apply listen types
        for (const type of Object.keys(this._listeners)) {
            this._eventSource.addEventListener(type, this._onevent_wrapped);
        }
    }

    _onopen(event) {
        if (this.readyState === 0) {
            this.readyState = 1;
            this.onopen(event);
        }
    }

    _onerror(event) {
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

    _onevent(event) {
        if (event.lastEventId) {
            this._lastEventId = event.lastEventId;
        }

        const listenersForType = this._listeners[event.type];
        if (listenersForType != null) {
            // operate on a copy
            for (const listener of [...listenersForType]) {
                listener(event);
            }
        }

        if (event.type === 'message') {
            this.onmessage(event);
        }
    }

    onopen(event) {
        // may be overridden
    }

    onerror(event) {
        // may be overridden
    }

    onmessage(event) {
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

    addEventListener(inType, callback) {
        const type = inType.toString();

        if (!(type in this._listeners)) {
            this._listeners[type] = [];
            if (this._eventSource) {
                this._eventSource.addEventListener(type, this._onevent_wrapped);
            }
        }

        const listenersForType = this._listeners[type];
        if (!listenersForType.includes(callback)) {
            this._listeners[type] = [...listenersForType, callback];
        }
    }

    removeEventListener(inType, callback) {
        const type = inType.toString();

        if (type in this._listeners) {

            const listenersForType = this._listeners[type];

            const updatedListenersForType = listenersForType.filter(l => l !== callback);

            if (updatedListenersForType.length > 0) {
                this._listeners[type] = updatedListenersForType;
            } else {
                delete this._listeners[type];
                if (this._eventSource) {
                    this._eventSource.removeEventListener(type, this._onevent_wrapped);
                }
            }
        }
    }
}
