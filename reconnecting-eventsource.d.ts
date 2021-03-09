export interface Configuration extends EventSourceInit {
    // the maximum time to wait before attempting to reconnect in ms, default `3000`
    // note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
    max_retry_time: number;
}

export default class ReconnectingEventSource {
    readonly url: string;
    readonly readyState: number;
    max_retry_time: number;

    constructor (url: string, configuration?: Configuration);

    onopen: EventSource['onopen'];
    onerror: EventSource['onerror'];
    onmessage: EventSource['onmessage'];

    close (): void;
    addEventListener (inType: string, callback: (event: MessageEvent) => void): void;
    removeEventListener (inType: string, callback: (event: MessageEvent) => void): void;
}
