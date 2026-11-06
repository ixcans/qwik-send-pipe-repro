import type { RequestHandler } from '@qwik.dev/router';

const encoder = new TextEncoder();

/**
 * `?mode=error`  : the body stream errors after the first chunk (an upstream reset).
 * `?mode=endless`: the body never ends; the client leaves (curl --max-time).
 */
export const onGet: RequestHandler = ({ query, send }) => {
	const mode = query.get('mode');
	let timer: ReturnType<typeof setInterval> | undefined;
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(encoder.encode('first chunk\n'));
			if (mode === 'error') {
				setTimeout(() => controller.error(new Error('upstream reset')), 100);
			}
			if (mode === 'endless') {
				timer = setInterval(() => controller.enqueue(encoder.encode('tick\n')), 200);
			}
		},
		cancel() {
			clearInterval(timer);
		},
	});
	send(new Response(body, { headers: { 'Content-Type': 'text/plain' } }));
};
