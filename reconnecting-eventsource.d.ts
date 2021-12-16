export interface ReconnectingEventSourceInit extends EventSourceInit {
    // the maximum time to wait before attempting to reconnect in ms, default `3000`
    // note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
    max_retry_time?: number;
}

export default class ReconnectingEventSource extends EventSource {
    constructor(url: string | URL, eventSourceInitDict?: ReconnectingEventSourceInit);
    max_retry_time: number;
}
