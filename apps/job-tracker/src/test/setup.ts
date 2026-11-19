import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';
import { resetMockData } from '../mocks/handlers';
import { server } from '../mocks/server';

configure({ asyncUtilTimeout: 8000 });

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
  resetMockData();
});
afterAll(() => {
  server.close();
});
