import { type RenderToStreamOptions, renderToStream } from '@qwik.dev/core/server';
import Root from './root';

export default function (opts: RenderToStreamOptions) {
	return renderToStream(<Root />, opts);
}
