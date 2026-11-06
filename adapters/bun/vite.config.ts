import { bunServerAdapter } from '@qwik.dev/router/adapters/bun-server/vite';
import { extendConfig } from '@qwik.dev/router/vite';
import baseConfig from '../../vite.config.ts';

export default extendConfig(baseConfig, () => ({
	build: {
		ssr: true,
		outDir: 'dist-server',
		emptyOutDir: false,
		rollupOptions: { input: ['src/entry.bun-server.tsx', '@qwik-router-config'] },
	},
	plugins: [bunServerAdapter({ name: 'bun' })],
}));
