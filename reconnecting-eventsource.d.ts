export interface ReconnectableEventSourceInit extends EventSourceInit {
	// the maximum time to wait before attempting to reconnect in ms, default `3000`
	// note: wait time is randomised to prevent all clients from attempting to reconnect simultaneously
	max_retry_time?: number;
}

export default class ReconnectingEventSource extends EventSource {
	constructor(url: string, configuration?: ReconnectableEventSourceInit);

	readonly max_retry_time: number;
}
