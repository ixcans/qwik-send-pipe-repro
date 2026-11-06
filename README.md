# `ev.send(new Response(stream))` can take down a Bun server

Minimal reproduction for a Qwik Router issue: `send()` in the request event starts
`response.body.pipeTo(writableStream)` and drops the returned promise. If that pipe
rejects, nothing handles it, and Bun exits with code 1.

Versions: `@qwik.dev/router` / `@qwik.dev/core` `2.0.0-rc.4`, Bun 1.4.4 (linux), Vite 8.3.6.

The only route of interest is [`src/routes/stream/index.ts`](src/routes/stream/index.ts):

```ts
export const onGet: RequestHandler = ({ query, send }) => {
	// ...builds a ReadableStream (`?mode=error` or `?mode=endless`)...
	send(new Response(body, { headers: { 'Content-Type': 'text/plain' } }));
};
```

## Run

```sh
pnpm install
pnpm build
./check.sh
```

`check.sh` makes one request per mode and reports whether the server is still running:

| mode | what happens | result |
| --- | --- | --- |
| `error` | the body stream errors 100 ms after the first chunk (an upstream reset) | server exits with code 1, `error: upstream reset` |
| `endless` | the body never ends and the client leaves (`curl --max-time 2`) | server exits with code 1, `AbortError: The connection was closed.` |

## Cause

`packages/qwik-router/src/middleware/request-handler/request-event-core.ts`, `send()`:

```ts
statusOrResponse.body.pipeTo(writableStream);   // promise dropped
```

and in the numeric branch `writer.write(...)` and `writer.close()` are dropped the same way.

## Check of the fix

Appending `.catch(() => {})` to that one `pipeTo(...)` call in the built server
(`dist-server/entry.bun-server.js`) makes both modes keep the server alive.
