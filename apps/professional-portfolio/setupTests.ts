import '@testing-library/jest-dom';
import path from 'node:path';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

// content.ts resolves committed MDX from PORTFOLIO_ROOT (repo root); Jest's
// cwd is the app directory, so pin it before any spec imports the service.
process.env.PORTFOLIO_ROOT ??= path.resolve(__dirname, '../..');
