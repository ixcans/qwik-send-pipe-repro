import { createQwikRouter } from '@qwik.dev/router/middleware/bun';
import render from './entry.ssr';

const { router, notFound, staticFile } = createQwikRouter({ render });

Bun.serve({
	port: Number(Bun.env.PORT ?? 3000),
	async fetch(request: Request) {
		const staticResponse = await staticFile(request);
		if (staticResponse) return staticResponse;
		const routerResponse = await router(request);
		if (routerResponse) return routerResponse;
		return notFound(request);
	},
});

console.log('listening');
