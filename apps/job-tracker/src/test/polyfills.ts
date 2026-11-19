import {
  CompressionStream,
  DecompressionStream,
  ReadableStream,
  TransformStream,
  WritableStream,
} from 'node:stream/web';
import { TextDecoder, TextEncoder } from 'node:util';
import { Headers } from 'headers-polyfill';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// The fetch polyfill only needs to satisfy MSW's JSON/string response bodies;
// binary/multipart bodies are out of scope for these mocks.
function bodyToText(body: BodyInit | null | undefined): string {
  if (body == null) return '';
  if (typeof body === 'string') return body;
  if (body instanceof URLSearchParams) return body.toString();
  if (body instanceof ArrayBuffer) return decoder.decode(body);
  if (ArrayBuffer.isView(body))
    return decoder.decode(
      new Uint8Array(body.buffer, body.byteOffset, body.byteLength),
    );
  return '';
}

function textToArrayBuffer(text: string): ArrayBuffer {
  const buf = encoder.encode(text);
  return buf.buffer.slice(buf.byteOffset, buf.byteLength);
}

// jsdom lacks fetch globals; MSW evaluates `class HttpResponse extends Response`
// at module load, so minimal spec-shaped Request/Response must exist first.
// The mocks only produce JSON/string bodies, which this covers.

abstract class PolyfillBody {
  protected constructor(protected readonly bodyText: string) {}

  text(): Promise<string> {
    return Promise.resolve(this.bodyText);
  }

  json(): Promise<unknown> {
    return this.text().then((text) => JSON.parse(text) as unknown);
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.text().then(textToArrayBuffer);
  }
}

class PolyfillResponse extends PolyfillBody {
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly ok: boolean;
  readonly type = 'default';
  readonly redirected = false;
  readonly body: ReadableStream<Uint8Array> | null;
  url = '';
  bodyUsed = false;

  constructor(body?: BodyInit | null, init: ResponseInit = {}) {
    const bodyText = bodyToText(body);
    super(bodyText);
    this.status = init.status ?? 200;
    this.statusText = init.statusText ?? '';
    this.headers = new Headers(init.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.body =
      bodyText === ''
        ? null
        : new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(encoder.encode(bodyText));
              controller.close();
            },
          });
  }

  text(): Promise<string> {
    this.bodyUsed = true;
    return super.text();
  }

  clone(): PolyfillResponse {
    return new PolyfillResponse(this.bodyText, {
      status: this.status,
      statusText: this.statusText,
      headers: Array.from(this.headers.entries()),
    });
  }

  static json(data: unknown, init: ResponseInit = {}): PolyfillResponse {
    const headers = new Headers(init.headers);
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    return new PolyfillResponse(JSON.stringify(data), {
      ...init,
      headers: Array.from(headers.entries()),
    });
  }

  static error(): PolyfillResponse {
    return new PolyfillResponse(null, { status: 0, statusText: '' });
  }
}

class PolyfillRequest extends PolyfillBody {
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
  readonly credentials = 'same-origin';
  readonly mode = 'cors';
  readonly signal: AbortSignal | null = null;

  constructor(input: string | URL | Request, init: RequestInit = {}) {
    super(init.body == null ? '' : bodyToText(init.body));
    this.url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    this.method = init.method ?? 'GET';
    this.headers = new Headers(init.headers);
  }

  clone(): PolyfillRequest {
    return new PolyfillRequest(this.url, {
      method: this.method,
      headers: Array.from(this.headers.entries()),
      body: this.bodyText,
    });
  }
}

// msw's websocket channel is unused by these mocks; a no-op stub satisfies
// its module-level `new BroadcastChannel(...)` under jsdom.
class StubBroadcastChannel {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;
  constructor(public name: string) {}
  postMessage(): void {}
  close(): void {}
  addEventListener(): void {}
  removeEventListener(): void {}
}

Object.assign(globalThis, {
  BroadcastChannel: StubBroadcastChannel,
  Headers,
  Request: PolyfillRequest,
  Response: PolyfillResponse,
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  CompressionStream,
  DecompressionStream,
  atob: (data: string) => Buffer.from(data, 'base64').toString('binary'),
  btoa: (data: string) => Buffer.from(data, 'binary').toString('base64'),
});

// jsdom lacks matchMedia; MUI useMediaQuery calls it during render.
// The DOM lib types claim it always exists, so widen the window type first.
const win = window as Window & {
  matchMedia?: (query: string) => MediaQueryList;
};
if (typeof win.matchMedia !== 'function') {
  win.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the deprecated listeners.
    addListener: () => {},
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- MediaQueryList still requires the deprecated listeners.
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
